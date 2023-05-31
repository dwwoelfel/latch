import {
  Anchor,
  AppShell,
  Container,
  Flex,
  Header,
  Loader,
  MantineProvider,
  Text,
} from '@mantine/core';
import {Suspense} from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {PreloadLink} from './PreloadLink';

export function App() {
  const loc = useLocation();
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AppShell
        padding="md"
        header={
          <Header height={60} p="sm">
            <Flex
              style={{height: '100%'}}
              align={'center'}
              justify={'space-between'}>
              {loc.pathname === '/' ? (
                <Text>Latch</Text>
              ) : (
                <PreloadLink to="/">Latch</PreloadLink>
              )}
              {loc.pathname === '/new-flag' ? null : (
                <Anchor to="/new-flag" component={Link}>
                  Create flag
                </Anchor>
              )}
            </Flex>
          </Header>
        }>
        <Suspense
          fallback={
            <Container>
              <Flex align={'center'} justify={'center'}>
                <Loader />
              </Flex>
            </Container>
          }>
          <Outlet />
        </Suspense>
      </AppShell>
    </MantineProvider>
  );
}
