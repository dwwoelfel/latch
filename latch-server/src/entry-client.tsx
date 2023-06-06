import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {RelayEnvironmentProvider} from 'react-relay';
import {
  RouterProvider,
  createBrowserRouter,
  matchRoutes,
} from 'react-router-dom';
import {
  GraphQLSingularResponse,
  Network,
  RequestParameters,
  Variables,
} from 'relay-runtime';
import {createEnvironment} from './client/Environment';
import {RoutesContext, createRoutes} from './client/routes';
import {authNotify} from './client/authPopup';

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
  const json: GraphQLSingularResponse = await response.json();

  if ('errors' in json && json.errors?.length) {
    if (
      json.errors?.find((e) => {
        // @ts-expect-error: valid key for error, but missing in relay
        const type = e.extensions?.type;
        if (type === 'auth/missing') {
          return true;
        }
      })
    ) {
      authNotify.notifyLoggedOut();
    }
  }
  return json;
}

const network = Network.create(fetchQuery);

let records = undefined;

try {
  const recordsJson = document.getElementById('__relay-records__')?.innerText;
  if (recordsJson) {
    records = JSON.parse(recordsJson);
  }
} catch (e) {}

const environment = createEnvironment(network, records);

const routes = createRoutes(environment);

const router = createBrowserRouter(routes);

const lazyMatches = matchRoutes(routes, window.location)?.filter(
  (m) => m.route.lazy,
);

async function main() {
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
}

main();
