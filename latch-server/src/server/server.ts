import middie from '@fastify/middie';
import {Bucket} from '@google-cloud/storage';
import {createStylesServer, getSSRStyles} from '@mantine/ssr';
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from 'fastify';
import {DocumentNode, GraphQLError, execute, parse, validate} from 'graphql';
import {
  FetchFunction,
  GraphQLResponse,
  Network,
  RequestParameters,
  Variables,
} from 'relay-runtime';
import {createContext, schema} from '../schema.js';
import {graphiqlStandalone} from './template.js';
// @ts-expect-error: uses esbuild binary loader
import favicon from './favicon.js';

import {EmotionServer} from '@emotion/server/create-instance';
import {Topic} from '@google-cloud/pubsub';
import fs from 'fs';
import type {Network as NetworkType} from 'relay-runtime/lib/network/RelayNetworkTypes.js';
import {Env} from '../index.js';

import fastifyStatic from '@fastify/static';
import path from 'path';
import {fileURLToPath} from 'url';
// @ts-expect-error: uses esbuild binary loader
import logo from './logo.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

declare module 'fastify' {
  interface FastifyRequest {
    bucket: Bucket;
    topic: Topic;
  }
}

async function makeCatchAllDev({
  server,
  network,
  stylesServer,
}: {
  server: FastifyInstance;
  network: NetworkType;
  stylesServer: EmotionServer;
}) {
  const {createServer: createViteServer} = await import('vite');
  const vite = await createViteServer({
    server: {middlewareMode: true},
    ssr: {
      noExternal: ['fsevents'],
    },
    optimizeDeps: {
      exclude: ['fsevents'],
    },
    appType: 'custom',
  });

  const template = fs.readFileSync(`${__dirname}../../index.html`, 'utf-8');

  const catchallHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const url = request.url;

    try {
      const vitedTemplate = await vite.transformIndexHtml(url, template);

      const {render} = await vite.ssrLoadModule('src/entry-server');

      const {html: appHtml, records} = await render(network, request);

      const styles = getSSRStyles(appHtml, stylesServer);

      const html = vitedTemplate
        .replace('<!--ssr-outlet-->', appHtml)
        .replace('<!--ssr-style-->', styles)
        .replace('<!--relay-records-->', JSON.stringify(records));

      reply.code(200).header('content-type', 'text/html').send(html);
    } catch (e) {
      if (e instanceof Response) {
        const body = await e.text();
        const headers: {[key: string]: string} = {};
        for (const [k, v] of e.headers) {
          headers[k] = v;
        }
        reply.code(e.status).headers(headers).send(body);
        return;
      }
      vite.ssrFixStacktrace(e as any);
      throw e;
    }
  };

  server.use(vite.middlewares);
  return catchallHandler;
}

async function makeCatchAllProd({
  server,
  network,
  stylesServer,
}: {
  server: FastifyInstance;
  network: NetworkType;
  stylesServer: EmotionServer;
}) {
  const vitedTemplate = fs.readFileSync(
    `${__dirname}../client/index.html`,
    'utf-8',
  );
  const catchallHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const {render} = await import('../entry-server.js');

      const {html: appHtml, records} = await render(network, request);

      const styles = getSSRStyles(appHtml, stylesServer);

      const html = vitedTemplate
        .replace('<!--ssr-outlet-->', appHtml)
        .replace('<!--ssr-style-->', styles)
        .replace('<!--relay-records-->', JSON.stringify(records));

      reply.code(200).header('content-type', 'text/html').send(html);
    } catch (e) {
      if (e instanceof Response) {
        const body = await e.text();
        const headers: {[key: string]: string} = {};
        for (const [k, v] of e.headers) {
          headers[k] = v;
        }
        reply.code(e.status).headers(headers).send(body);
        return;
      }
      throw e;
    }
  };

  server.register(fastifyStatic, {
    root: path.join(__dirname, '../client/assets'),
    prefix: '/assets',
  });

  return catchallHandler;
}

async function setupVite({
  server,
  bucket,
  topic,
  isDev,
}: {
  server: FastifyInstance;
  bucket: Bucket;
  topic: Topic;
  isDev: boolean;
}) {
  const stylesServer = createStylesServer();

  const fetchQuery: FetchFunction = async (
    request: RequestParameters,
    variables: Variables,
  ) => {
    if (!request.text) {
      throw new Error('Invalid query.');
    }
    const res = await execute({
      schema,
      document: parse(request.text),
      contextValue: createContext({bucket, topic}),
      variableValues: variables,
    });

    if (res.errors?.length) {
      console.log('Errors', JSON.stringify(res.errors));
    }

    return res as GraphQLResponse;
  };

  const network = Network.create(fetchQuery);

  const catchallHandler = await (isDev
    ? makeCatchAllDev({
        server,
        network,
        stylesServer,
      })
    : makeCatchAllProd({
        server,
        network,
        stylesServer,
      }));

  server.get('*', catchallHandler);
}

function safeParse(
  query: string,
):
  | {type: 'error'; response: {errors: GraphQLError[]}}
  | {type: 'ok'; document: DocumentNode} {
  try {
    const document = parse(query);
    return {type: 'ok', document};
  } catch (syntaxError) {
    return {
      type: 'error',
      response: {errors: [syntaxError as GraphQLError]},
    };
  }
}

type Handler<T extends RouteGenericInterface> = (
  request: FastifyRequest<T>,
  reply: FastifyReply,
) => Promise<
  void | any
> | void; /* TODO: better type for handler return value */

type GraphQLHandlerProps = {
  Body: {
    query: string;
    operationName?: string | null;
    variables?: {[key: string]: any};
  };
};

const graphqlHandler: Handler<GraphQLHandlerProps> = async (request) => {
  if (!request.body.query) {
    return {
      errors: [{message: 'Must provide a query string.'}],
    };
  }

  const parseResult = safeParse(request.body.query);
  if (parseResult.type === 'error') {
    return parseResult.response;
  }
  const document = parseResult.document;

  const validationErrors = validate(schema, document);
  if (validationErrors.length > 0) {
    return {errors: validationErrors};
  }

  const res = await execute({
    schema,
    document: document,
    contextValue: createContext({bucket: request.bucket, topic: request.topic}),
    variableValues: request.body.variables,
    operationName: request.body.operationName,
  });

  if (res.errors?.length) {
    console.log('errors', JSON.stringify(res.errors));
  }

  return res;
};

export async function createServer({
  bucket,
  topic,
  isDev,
}: {
  bucket: Bucket;
  topic: Topic;
  env: Env;
  isDev: boolean;
}) {
  const server = fastify({
    logger: true,
  });

  server.setErrorHandler(function (error, _request, reply) {
    console.error(error);
    reply.status(500).send('Internal error');
  });

  await server.register(middie);

  server.addHook('onRequest', async (request) => {
    request.bucket = bucket;
    request.topic = topic;
  });

  server.post<GraphQLHandlerProps>('/graphql', graphqlHandler);
  server.get('/graphiql', (_request, reply) =>
    reply
      .code(200)
      .header('content-type', 'text/html')
      .send(graphiqlStandalone),
  );
  server.get('/favicon.svg', (_request, reply) =>
    reply
      .code(200)
      .header('content-type', 'image/svg+xml')
      .send(Buffer.from(logo)),
  );

  server.get('/favicon.ico', (_request, reply) =>
    reply
      .code(200)
      .header('content-type', 'image/ico')
      .send(Buffer.from(favicon)),
  );

  await setupVite({
    server,
    bucket,
    topic,
    isDev,
  });

  return server;
}
