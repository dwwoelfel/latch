import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  matchRoutes,
} from 'react-router-dom';
import {createEnvironment} from './client/Environment';
import {RoutesContext, createRoutes} from './client/routes';
import {RelayEnvironmentProvider} from 'react-relay';
import {Network, RequestParameters, Variables} from 'relay-runtime';

async function fetchQuery(request: RequestParameters, variables: Variables) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });
  return response.json();
}

const network = Network.create(fetchQuery);

const records = document.getElementById('__relay-records__')?.innerText;

const environment = createEnvironment(
  network,
  records ? JSON.parse(records) : undefined,
);

const routes = createRoutes(environment);

const router = createBrowserRouter(routes);

const lazyMatches = matchRoutes(routes, window.location)?.filter(
  (m) => m.route.lazy,
);

// Load the lazy matches and update the routes before creating your router
// so we can hydrate the SSR-rendered content synchronously
if (lazyMatches && lazyMatches?.length > 0) {
  await Promise.all(
    lazyMatches.map(async (m) => {
      // @ts-expect-error: seems to work
      const routeModule = await m.route.lazy();
      Object.assign(m.route, {
        ...routeModule,
        lazy: undefined,
      });
    }),
  );
}

ReactDOM.hydrateRoot(
  // @ts-expect-error: Not sure catching the error would help here
  document.getElementById('app'),
  <StrictMode>
    <RoutesContext.Provider value={routes}>
      <RelayEnvironmentProvider environment={environment}>
        <RouterProvider router={router} />
      </RelayEnvironmentProvider>
    </RoutesContext.Provider>
  </StrictMode>,
);
