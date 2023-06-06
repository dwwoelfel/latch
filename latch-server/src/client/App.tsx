import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Button,
  ColorPicker,
  ColorSwatch,
  Container,
  Flex,
  Group,
  Header,
  Loader,
  LoadingOverlay,
  MantineProvider,
  MantineThemeOverride,
  Menu,
  Paper,
  Popover,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {IconBrandGoogle, IconPlus, IconSelector} from '@tabler/icons-react';
import {Suspense, useEffect, useRef, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import type {PreloadedQuery} from 'react-relay';
import {graphql} from 'react-relay';
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import {CreateEnvironmentForm} from './CreateEnvironmentForm';
import {PreloadLink} from './PreloadLink';
import {AppEnvironmentSelector$key} from './__generated__/AppEnvironmentSelector.graphql';
import type {AppQuery as AppQueryType} from './__generated__/AppQuery.graphql';
import AppQuery from './__generated__/AppQuery.graphql';
import {AppUpdateEnvironmentMutation} from './__generated__/AppUpdateEnvironmentMutation.graphql';
import {authNotify, login} from './authPopup';
import {
  loadQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from './react-relay';
import {getTextColor, shades} from './util';

type LoaderData = {
  rootQuery: PreloadedQuery<AppQueryType>;
};

export function loader(environment: RelayModernEnvironment): LoaderData {
  return {
    rootQuery: loadQuery(
      environment,
      AppQuery,
      {},
      {fetchPolicy: 'store-and-network'},
    ),
  };
}

export type OutletContext = {
  env: {readonly name: string; readonly color: string};
};

function EnvironmentsGuard(props: {
  env: {readonly name: string; readonly color: string};
}) {
  if (props.env) {
    const context: OutletContext = {env: props.env};
    return <Outlet context={context} />;
  }

  return (
    <Container size="sm">
      <Title order={3} mb="sm">
        Create environment
      </Title>

      <Container size="xs" p={0} m={0}>
        <CreateEnvironmentForm />
      </Container>
    </Container>
  );
}

function EnvironmentSelector(props: {
  data: AppEnvironmentSelector$key;
  env: {name: string; color: string};
}) {
  const data = useFragment(
    graphql`
      fragment AppEnvironmentSelector on Viewer {
        environments {
          name
          color
        }
      }
    `,
    props.data,
  );

  const [commit, isInFlight] =
    useMutation<AppUpdateEnvironmentMutation>(graphql`
      mutation AppUpdateEnvironmentMutation($input: UpdateEnvironmentInput!) {
        updateEnvironment(input: $input) {
          viewer {
            ...AppEnvironmentSelector
          }
        }
      }
    `);

  if (!data.environments.length) {
    return null;
  }
  const env = props.env;

  const location = useLocation();

  const theme = useMantineTheme();

  return (
    <Group spacing={'xs'}>
      <Menu>
        <Menu.Target>
          <Button
            color={`env:${env.name}`}
            c={getTextColor(env.color)}
            px="sm"
            radius={'lg'}
            rightIcon={<IconSelector strokeWidth={2} size={'1rem'} />}>
            {env.name}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {data.environments
            .filter((e) => e.name !== env.name)
            .map((env) => {
              const search = new URLSearchParams(location.search);
              search.set('environment', env.name);
              const to = `${location.pathname}?${search.toString()}`;
              return (
                <PreloadLink
                  key={env.name}
                  style={{textDecoration: 'none', color: 'inherit'}}
                  to={to}>
                  <Menu.Item>
                    <Group align="center" spacing="xs">
                      <ColorSwatch size={'1rem'} color={env.color} />
                      <Text component="span">{env.name}</Text>
                    </Group>
                  </Menu.Item>
                </PreloadLink>
              );
            })}

          <PreloadLink
            style={{textDecoration: 'none', color: 'inherit'}}
            to="/environments/create">
            <Menu.Item>
              <Group spacing={'xs'} align={'center'}>
                <IconPlus size={'1rem'} stroke={2} />
                Create new environment
              </Group>
            </Menu.Item>
          </PreloadLink>
        </Menu.Dropdown>
      </Menu>
      <Popover>
        <Popover.Target>
          <ActionIcon>
            <ColorSwatch size={'1rem'} color={env.color} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Box pos={'relative'}>
            <LoadingOverlay
              visible={isInFlight}
              loaderProps={{variant: 'dots'}}
              overlayBlur={0.5}
            />
            <Box>
              <Text size="sm">Change color for environment.</Text>
              <ColorPicker
                color={env.color}
                format="hex"
                defaultValue={env.color}
                onChangeEnd={(color) =>
                  commit({
                    variables: {input: {name: env.name, patch: {color}}},
                    onError(e) {
                      // @ts-expect-error: Doesn't like the check for e.source
                      alert(e.source?.errors?.[0]?.message || e.message);
                    },
                    onCompleted(_resp, errors) {
                      if (errors) {
                        alert(errors?.[0]?.message || 'Unknown error.');
                      }
                    },
                  })
                }
                swatches={Object.entries(theme.colors).flatMap(
                  ([name, colors]) => {
                    if (name === 'dark' || name.startsWith('env')) {
                      return [];
                    }
                    return [colors[5]];
                  },
                )}
              />
            </Box>
          </Box>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  console.log('error', error);
  const location = useLocation();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const handleLogin = async () => {
    try {
      const loginErr = await login();
      if (loginErr) {
        setLoginError(loginErr.message);
      } else {
        navigate(location, {
          replace: true,
        });
        resetErrorBoundary();
      }
    } catch (e) {
      setLoginError((e as Error).message);
    }
  };
  return (
    <Container size="sm">
      <Flex m="1em" justify="center" align="center">
        {loginError ? <Text>{loginError}</Text> : null}
        <Button
          leftIcon={<IconBrandGoogle size="1rem" />}
          onClick={handleLogin}>
          Login
        </Button>
      </Flex>
    </Container>
  );
}

function AppImpl() {
  const loc = useLocation();
  const {rootQuery} = useLoaderData() as LoaderData;
  const data = usePreloadedQuery(
    graphql`
      query AppQuery {
        viewer {
          environments {
            name
            color
          }
          ...AppEnvironmentSelector
        }
      }
    `,
    rootQuery,
  );

  const colors: MantineThemeOverride['colors'] = {};
  for (const env of data.viewer.environments) {
    colors[`env:${env.name}`] = shades(env.color);
  }

  const isEnvironmentAgnostic =
    loc.pathname.endsWith('create') || loc.pathname.startsWith('/flag');

  const lastSetEnvironment = useRef<null | string>(null);

  const [params, setParams] = useSearchParams();

  const envParam = params.get('environment');
  let intendedEnv;
  if (envParam) {
    intendedEnv = data.viewer.environments.find((e) => {
      return e.name === envParam;
    });
  } else if (lastSetEnvironment.current) {
    intendedEnv = data.viewer.environments.find((e) => {
      return e.name === lastSetEnvironment.current;
    });
  }

  if (intendedEnv) {
    lastSetEnvironment.current = intendedEnv.name;
  }

  const env = intendedEnv || data.viewer.environments[0];

  useEffect(() => {
    if (
      !isEnvironmentAgnostic &&
      env &&
      (!params.get('environment') || params.get('environment') !== env.name)
    ) {
      setParams(
        (p) => {
          p.set('environment', env.name);
          return p;
        },
        {replace: true},
      );
    }
  }, [isEnvironmentAgnostic, params]);

  const [showLoginHeader, setShowLoginHeader] = useState(false);

  useEffect(() => {
    const logoutCallback = () => {
      setShowLoginHeader(true);
    };
    const loginCallback = () => {
      setShowLoginHeader(false);
    };
    authNotify.addEventListener('logout', logoutCallback);
    authNotify.addEventListener('login', loginCallback);
    () => {
      authNotify.removeEventListener('logout', logoutCallback);
      authNotify.removeEventListener('login', loginCallback);
    };
  });

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{colors}}>
      <AppShell
        padding="md"
        header={
          <Header height={showLoginHeader ? 120 : 60} p={0}>
            {showLoginHeader ? (
              <Paper h="50%" shadow="sm">
                <Flex align="center" justify={'center'} p="sm">
                  <Text pr="xs">You've been logged out.</Text>
                  <Button
                    leftIcon={<IconBrandGoogle size="1rem" />}
                    color="cyan"
                    onClick={() => login()}>
                    Login
                  </Button>
                </Flex>
              </Paper>
            ) : null}
            <Flex
              opacity={showLoginHeader ? 0.5 : undefined}
              style={{height: showLoginHeader ? '50%' : '100%'}}
              align={'center'}
              justify={'space-between'}
              p="sm">
              <Group>
                {loc.pathname === '/' || !data.viewer.environments.length ? (
                  <Text>Latch</Text>
                ) : (
                  <PreloadLink to="/">Latch</PreloadLink>
                )}
                {env && !isEnvironmentAgnostic ? (
                  <EnvironmentSelector data={data.viewer} env={env} />
                ) : null}
              </Group>
              <Group>
                {loc.pathname.endsWith('create') ||
                !data.viewer.environments.length ? null : (
                  <Anchor to="/flags/create" component={Link}>
                    Create flag
                  </Anchor>
                )}
                <Menu>
                  <Menu.Target>
                    <ActionIcon>
                      <Avatar></Avatar>
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={async () => {
                        await fetch('/logout', {
                          method: 'POST',
                          headers: {
                            'content-type': 'application/json',
                          },
                          body: JSON.stringify({token: `${Math.random()}`}),
                        });
                        window.location.href = window.location.href;
                      }}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Flex>
          </Header>
        }>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense
            fallback={
              <Container>
                <Flex align={'center'} justify={'center'}>
                  <Loader />
                </Flex>
              </Container>
            }>
            <Box opacity={showLoginHeader ? 0.5 : undefined}>
              <EnvironmentsGuard env={env} />
            </Box>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </MantineProvider>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <Container>
            <Flex align={'center'} justify={'center'}>
              <Loader />
            </Flex>
          </Container>
        }>
        <AppImpl />
      </Suspense>
    </ErrorBoundary>
  );
}
