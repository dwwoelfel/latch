import middie from '@fastify/middie';
import {Storage} from '@google-cloud/storage';
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
// @ts-expect-error: favicon.js uses esbuild binary loader
import favicon from './favicon.js';

import {EmotionServer} from '@emotion/server/create-instance';
import {PubSub} from '@google-cloud/pubsub';
import fs from 'fs';
import type {Network as NetworkType} from 'relay-runtime/lib/network/RelayNetworkTypes.js';

import fastifyStatic from '@fastify/static';
import path from 'path';
import {fileURLToPath} from 'url';

import cookie from '@fastify/cookie';
import {randomBytes} from 'crypto';
import {addDays, addMinutes} from 'date-fns';
import {google} from 'googleapis';
import {Base64} from 'js-base64';
import {Config} from '../config.js';
import {safeCompare} from '../util.js';
// @ts-expect-error: logo.js uses esbuild binary loader
import logo from './logo.js';
import sodium from 'sodium-native';

import type {GetTokenResponse} from './googleapisDeclarations.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

declare module 'fastify' {
  interface FastifyRequest {
    config: Config;
  }
}

type Creds = {accessToken: string; expiryDate: number; refreshToken: string};

function setAuthCookie(
  request: FastifyRequest,
  reply: FastifyReply,
  credentials: Creds,
) {
  const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(nonce);

  const message = Buffer.from(JSON.stringify(credentials), 'utf-8');

  const enc = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);

  sodium.crypto_secretbox_easy(
    enc,
    message,
    nonce,
    request.config.encryptionKey.secret,
  );
  const cookie = Base64.fromUint8Array(Buffer.concat([nonce, enc]), true);

  reply.setCookie(cookieKey, cookie, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !request.config.isDev,
    expires: addDays(new Date(), 7),
    path: '/',
  });
}

function credentialsFromAuthCookie(request: FastifyRequest): Creds | null {
  const cookie = request.cookies?.[cookieKey];
  if (!cookie) {
    return null;
  }

  try {
    const cookieBytes = Base64.toUint8Array(cookie);
    const nonce = cookieBytes.slice(0, sodium.crypto_secretbox_NONCEBYTES);
    const enc = cookieBytes.slice(sodium.crypto_secretbox_NONCEBYTES);
    const plainText = Buffer.alloc(
      enc.length - sodium.crypto_secretbox_MACBYTES,
    );

    if (
      !sodium.crypto_secretbox_open_easy(
        plainText,
        Buffer.from(enc),
        Buffer.from(nonce),
        request.config.encryptionKey.secret,
      )
    ) {
      return null;
    }

    const creds = JSON.parse(plainText.toString('utf-8'));
    if (creds.accessToken && creds.expiryDate && creds.refreshToken) {
      return creds;
    }
    return null;
  } catch (e) {
    console.error('Error decoding cookie', e);
    return null;
  }
}

function oauthClient(request: FastifyRequest) {
  return new google.auth.OAuth2(
    request.config.clientId,
    request.config.clientSecret.secret,
    `${request.config.isDev ? 'http' : 'https'}://${
      request.headers.host
    }/oauth/callback`,
  );
}

async function executeQuery({
  request,
  reply,
  document,
  variables,
  operationName,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  document: DocumentNode;
  variables?: Variables;
  operationName?: string | null;
}) {
  const config = request.config;
  const authClient = oauthClient(request);
  const creds = credentialsFromAuthCookie(request);

  if (!creds) {
    return {
      errors: [
        {
          message: 'Please log in.',
          extensions: {
            type: 'auth/missing',
          },
        },
      ],
    };
  }

  authClient.setCredentials({
    access_token: creds.accessToken,
    expiry_date: creds.expiryDate,
    refresh_token: creds.refreshToken,
  });

  const bucket = new Storage({authClient: authClient}).bucket(
    config.bucketName,
  );

  const topic = new PubSub({
    // @ts-expect-error: This seems to work
    authClient: authClient,
  }).topic(config.topicName);
  const res = await execute({
    schema,
    document,
    contextValue: createContext({bucket, topic}),
    variableValues: variables,
    operationName,
  });

  if (res.errors?.length) {
    console.log('Errors', JSON.stringify(res.errors));
  }

  if (authClient.credentials.access_token !== creds.accessToken) {
    if (
      authClient.credentials.access_token &&
      authClient.credentials.expiry_date &&
      authClient.credentials.refresh_token
    ) {
      setAuthCookie(request, reply, {
        accessToken: authClient.credentials.access_token,
        expiryDate: authClient.credentials.expiry_date,
        refreshToken: authClient.credentials.refresh_token,
      });
    }
  }

  return res as GraphQLResponse;
}

function createNetwork(
  fastifyRequest: FastifyRequest,
  reply: FastifyReply,
): NetworkType {
  const fetchQuery: FetchFunction = async (
    request: RequestParameters,
    variables: Variables,
  ) => {
    if (!request.text) {
      throw new Error('Invalid query.');
    }
    return executeQuery({
      request: fastifyRequest,
      reply,
      document: parse(request.text),
      variables,
    });
  };

  return Network.create(fetchQuery);
}

async function makeCatchAllDev({
  server,
  stylesServer,
}: {
  server: FastifyInstance;

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

      const network = createNetwork(request, reply);

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
  return {catchallHandler, shutdown: () => vite.close()};
}

async function makeCatchAllProd({
  server,
  stylesServer,
}: {
  server: FastifyInstance;
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

      const network = createNetwork(request, reply);

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

  return {catchallHandler, shutdown: () => Promise.resolve()};
}

async function setupVite({
  server,
  config,
}: {
  server: FastifyInstance;
  config: Config;
}) {
  const stylesServer = createStylesServer();

  const {catchallHandler, shutdown} = await (config.isDev
    ? makeCatchAllDev({server, stylesServer})
    : makeCatchAllProd({server, stylesServer}));

  server.get('*', catchallHandler);
  return shutdown;
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

const graphqlHandler: Handler<GraphQLHandlerProps> = async (request, reply) => {
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

  return await executeQuery({
    request,
    reply,
    document: document,
    variables: request.body.variables,
    operationName: request.body.operationName,
  });
};

// NEXTUP add oauth callback (use cookie to store state and then cookie to store token)
// 1. Then add login on page
// 2. Then use the user's token to make requests to google storage
// 3. And catch that in the relay env to set login status
// Only allowed key that firebase hosting will forward to cloud run
const cookieKey = '__session';
const stateRandomBytes = 32;
const googleScopes = [
  'https://www.googleapis.com/auth/devstorage.read_write',
  'https://www.googleapis.com/auth/pubsub',
];

function performOauthStart({
  request,
  reply,
  redirectPath,
  prompt,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  redirectPath: string;
  prompt?: 'consent';
}) {
  const oauth2Client = oauthClient(request);

  const state = Base64.fromUint8Array(
    Buffer.concat([
      randomBytes(stateRandomBytes),
      Buffer.from(redirectPath || '/', 'utf-8'),
    ]),
    true /* urlsafe */,
  );

  const redirect = oauth2Client.generateAuthUrl({
    scope: googleScopes,
    state: state,
    access_type: 'offline',
    prompt: prompt,
  });

  reply.setCookie(cookieKey, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !request.config.isDev,
    expires: addMinutes(new Date(), 15),
    path: '/oauth/callback',
  });

  reply.redirect(redirect);
}

type OauthStartHandler = {
  Querystring: {redirectPath?: string};
};
const oauthStartHandler: Handler<OauthStartHandler> = async (
  request,
  reply,
) => {
  performOauthStart({
    request,
    reply,
    redirectPath: request.query.redirectPath || '/',
  });
};

function oauthCallbackReply(reply: FastifyReply, resp: {error?: string}) {
  reply
    .status(resp.error ? 400 : 200)
    .header('content-type', 'text/html')
    .send(
      `<!DOCTYPE html>
      <html>
        <head>
          <script>
            window.opener.postMessage(${JSON.stringify(resp)}, window.origin)
          </script>
          <noscript>Please enable javascript to complete the auth flow.</noscript>
        <body>
        <center style="padding: 80px">${resp.error}</center>
        </body>
      </html>`,
    );
}

async function safeGetToken(
  request: FastifyRequest,
  code: string,
): Promise<Error | GetTokenResponse> {
  try {
    return await oauthClient(request).getToken(code);
  } catch (e) {
    console.log('error getting token', e);
    return new Error('Could not get token.');
  }
}

type OauthCallbackHandler = {
  Querystring: {code?: string; error?: string; state?: string};
};

const oauthCallbackHandler: Handler<OauthCallbackHandler> = async (
  request,
  reply,
) => {
  const {state: stateParam, code, error} = request.query;
  if (error) {
    oauthCallbackReply(reply, {error: `OAuth error. ${error}`});
    return;
  }
  if (!stateParam) {
    oauthCallbackReply(reply, {error: `Missing state param.`});
    return;
  }
  if (!code) {
    oauthCallbackReply(reply, {error: `Missing code param.`});
    return;
  }

  const stateCookie = request.cookies?.[cookieKey];
  if (!stateCookie) {
    oauthCallbackReply(reply, {
      error: `Missing cookie. The request may be expired, please try again.`,
    });
    return;
  }

  if (!safeCompare(stateParam, stateCookie)) {
    oauthCallbackReply(reply, {
      error: `Invalid state. The request may be expired, please try again.`,
    });
    return;
  }

  // Save in case we want to do a redirect flow (on mobile?)
  const redirectPath = Buffer.from(
    Base64.toUint8Array(stateCookie).slice(32),
  ).toString('utf-8');

  const token = await safeGetToken(request, code);
  if (token instanceof Error) {
    oauthCallbackReply(reply, {
      error: token.message,
    });
    return;
  }

  const accessToken = token.tokens.access_token;
  const expiryDate = token.tokens.expiry_date;
  if (!accessToken || !expiryDate) {
    oauthCallbackReply(reply, {
      error: `Could not get access token, please try again.`,
    });
    return;
  }

  for (const scope of googleScopes) {
    if (!token.tokens.scope?.includes(scope)) {
      oauthCallbackReply(reply, {
        error: `Missing scope ${scope}. Please try again.`,
      });
      return;
    }
  }

  const refreshToken = token.tokens.refresh_token;

  if (!refreshToken) {
    // Go back through the oauth flow to get a refresh token
    performOauthStart({
      request,
      reply,
      redirectPath,
      prompt: 'consent',
    });
    return;
  }

  setAuthCookie(request, reply, {accessToken, expiryDate, refreshToken});

  oauthCallbackReply(reply, {});
};

type LogoutHandler = {
  Body: {token?: string};
};

const logoutHandler: Handler<LogoutHandler> = async (request, reply) => {
  if (request.headers['content-type'] !== 'application/json') {
    reply
      .code(400)
      .header('content-type', 'application/json')
      .send(
        JSON.stringify({
          errors: [{message: 'Content-Type header must be application/json'}],
        }),
      );
    return;
  }

  // Require a body so that the request can't bypass CORS
  if (!request.body.token) {
    reply
      .code(400)
      .header('content-type', 'application/json')
      .send({errors: [{message: 'Missing body'}]});
    return;
  }

  reply.clearCookie(cookieKey, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !request.config.isDev,
    path: '/',
  });
  return {ok: true};
};

export async function createServer({config}: {config: Config}) {
  const server = fastify({
    logger: true,
  });

  server.setErrorHandler(function (error, _request, reply) {
    console.error(error);
    reply.status(500).send('Internal error');
  });

  await server.register(middie);

  server.addHook('onRequest', async (request) => {
    request.config = config;
  });

  server.register(cookie, {});

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

  server.get<OauthStartHandler>('/oauth/start', oauthStartHandler);
  server.get<OauthCallbackHandler>('/oauth/callback', oauthCallbackHandler);
  server.post('/logout', logoutHandler);

  const shutdown = await setupVite({
    server,
    config,
  });

  return {server, shutdown};
}
