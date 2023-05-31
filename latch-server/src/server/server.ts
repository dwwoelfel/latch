import middie from '@fastify/middie';
import {Bucket} from '@google-cloud/storage';
import {createStylesServer, getSSRStyles} from '@mantine/ssr';
import vitePluginReact from '@vitejs/plugin-react';
import fastify, {
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from 'fastify';
import {DocumentNode, GraphQLError, execute, parse, validate} from 'graphql';
import {createServer as createViteServer} from 'vite';
import {createContext, schema} from '../schema.js';
import {graphiqlStandalone, template} from './template.js';
import {
  FetchFunction,
  GraphQLResponse,
  Network,
  RequestParameters,
  Variables,
} from 'relay-runtime';
// @ts-expect-error: uses esbuild binary loader
import favicon from './favicon.js';
// @ts-expect-error: uses esbuild binary loader
import logo from './logo.js';

declare module 'fastify' {
  interface FastifyRequest {
    bucket: Bucket;
  }
}

async function setupVite({bucket}: {bucket: Bucket}) {
  const vite = await createViteServer({
    server: {middlewareMode: true},
    plugins: [
      vitePluginReact({
        babel: {
          plugins: ['relay'],
        },
      }),
    ],
    ssr: {
      noExternal: ['fsevents'],
    },
    optimizeDeps: {
      exclude: ['fsevents'],
    },
    appType: 'custom',
  });

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
      contextValue: createContext({bucket: bucket}),
      variableValues: variables,
    });

    return res as GraphQLResponse;
  };

  const network = Network.create(fetchQuery);

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

  return {vite, catchallHandler};
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

  return await execute({
    schema,
    document: document,
    contextValue: createContext({bucket: request.bucket}),
    variableValues: request.body.variables,
    operationName: request.body.operationName,
  });
};

export async function createServer({bucket}: {bucket: Bucket}) {
  const server = fastify({
    logger: true,
  });

  await server.register(middie);

  server.addHook('onRequest', async (request) => {
    request.bucket = bucket;
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

  const {vite, catchallHandler} = await setupVite({bucket: bucket});
  server.use(vite.middlewares);
  server.get('*', catchallHandler);

  return server;
}
