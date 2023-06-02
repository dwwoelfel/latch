import {RouteObject, To, matchRoutes, redirect} from 'react-router-dom';
import {App, loader as appLoader} from './App.js';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment.js';
import {createContext} from 'react';

// TOOD: 404 page
export const createRoutes = (
  environment: RelayModernEnvironment,
): RouteObject[] => [
  {
    path: '/',
    element: <App />,
    loader() {
      return appLoader(environment);
    },
    children: [
      {
        path: '/',
        async lazy() {
          const {loader, IndexPage} = await import('./IndexPage.tsx');
          return {
            loader: loader.bind(loader, environment),
            element: <IndexPage />,
          };
        },
      },
      {
        path: '/flags/create',
        async lazy() {
          const {NewFlagPage, loader} = await import('./NewFlagPage.tsx');
          return {
            loader: loader.bind(loader, environment),
            element: <NewFlagPage />,
          };
        },
      },
      {
        path: '/environments/create',
        async lazy() {
          const {NewEnvironmentPage} = await import('./NewEnvironmentPage.tsx');
          return {
            element: <NewEnvironmentPage />,
          };
        },
      },
      {
        path: '/flag/:key',
        async lazy() {
          const {loader, FlagPage} = await import('./FlagPage.tsx');
          return {
            loader: loader.bind(loader, environment),
            element: <FlagPage />,
          };
        },
      },
    ],
  },
  {
    path: '/redirect',
    loader() {
      return redirect('/');
    },
  },
];

export const RoutesContext = createContext<RouteObject[] | null>(null);

export function preloadRoute(routes: RouteObject[], to: To) {
  return Promise.all(
    (matchRoutes(routes, to) || []).map(async (m) => {
      if (m.route.lazy) {
        const routeModule = await m.route.lazy();
        Object.assign(m.route, {
          ...routeModule,
          lazy: undefined,
        });
        if (routeModule.loader) {
          // @ts-expect-error: seems to work
          return routeModule.loader(m);
        }
      }

      if (m.route.loader) {
        // @ts-expect-error: seems to work
        return m.route.loader(m);
      }
    }),
  );
}
