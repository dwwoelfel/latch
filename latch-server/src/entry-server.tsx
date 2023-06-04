import ReactDOMServer from 'react-dom/server';
import {
  StaticRouterProvider,
  createStaticHandler,
  createStaticRouter,
} from 'react-router-dom/server';

import {FastifyRequest} from 'fastify';
// @ts-expect-error: trying to work around esm/cjs errors 
import RelayEnvironmentProvider from 'react-relay/lib/relay-hooks/RelayEnvironmentProvider.js';
import {Network} from 'relay-runtime/lib/network/RelayNetworkTypes';
import {createEnvironment} from './client/Environment';
import {RoutesContext, createRoutes, preloadRoute} from './client/routes';

function makeRequest(req: FastifyRequest) {
  const origin = `${req.protocol}://${req.headers.host}`;
  // Note: This had to take originalUrl into account for presumably vite's proxying
  const url = new URL(req.url, origin);

  const controller = new AbortController();

  req.connection.on('close', () => controller.abort());

  const headers = new Headers();

  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  let init = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  return new Request(url.href, init);
}

export async function render(network: Network, request: FastifyRequest) {
  const environment = createEnvironment(network);
  const routes = createRoutes(environment);

  const routeHandler = createStaticHandler(routes);

  const context = await routeHandler.query(makeRequest(request));

  if (context instanceof Response) {
    throw context;
  }

  const staticRouter = createStaticRouter(routeHandler.dataRoutes, context);

  const preloads = await preloadRoute(routes, request.url);

  for (const preload of preloads) {
    // @ts-expect-error: works in practive
    if (preload?.rootQuery?.kind === 'PreloadedQuery') {
      // @ts-expect-error: works in practive
      await preload.rootQuery.source.toPromise();
    }
  }

  const html = ReactDOMServer.renderToString(
    <RoutesContext.Provider value={routes}>
      <RelayEnvironmentProvider environment={environment}>
        <StaticRouterProvider router={staticRouter} context={context} />
      </RelayEnvironmentProvider>
    </RoutesContext.Provider>,
  );
  const records = environment.getStore().getSource().toJSON();
  return {html, records};
}
