import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Menu,
  Space,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {IconRefresh, IconSelector} from '@tabler/icons-react';
import {
  PreloadedQuery,
  graphql,
  loadQuery,
  useFragment,
  useMutation,
  usePaginationFragment,
  usePreloadedQuery,
} from 'react-relay';
import {useLoaderData, useOutletContext} from 'react-router-dom';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment.js';
import {PreloadLink} from './PreloadLink.js';
import {
  FeatureFlagType,
  IndexPageFlagRow$key,
} from './__generated__/IndexPageFlagRow.graphql.js';
import {IndexPageFlags$key} from './__generated__/IndexPageFlags.graphql.js';
import type {IndexPageQuery as IndexPageQueryType} from './__generated__/IndexPageQuery.graphql.js';
import IndexPageQuery from './__generated__/IndexPageQuery.graphql.js';
import {IndexPageUpdateFlagMutation} from './__generated__/IndexPageUpdateFlagMutation.graphql.js';
import {formatValue} from './flagFormUtil.js';
import {OutletContext} from './App.js';

type LoaderData = {
  rootQuery: PreloadedQuery<IndexPageQueryType>;
};

export const loader = (environment: RelayModernEnvironment): LoaderData => {
  return {
    rootQuery: loadQuery(
      environment,
      IndexPageQuery,
      {},
      {
        fetchPolicy:
          typeof window !== 'undefined'
            ? 'store-and-network'
            : 'store-or-network',
      },
    ),
  };
};

function friendlyType(type: FeatureFlagType): string {
  switch (type) {
    case 'BOOL':
      return 'boolean';
    case 'FLOAT':
      return 'float';
    case 'INT':
      return 'integer';
    case 'STRING':
      return 'string';
    case 'JSON':
      return 'json';
    case '%future added value':
      return type.toLowerCase();
  }
}

function FlagRow(props: {data: IndexPageFlagRow$key}) {
  const flag = useFragment(
    graphql`
      fragment IndexPageFlagRow on FeatureFlag {
        key
        type
        description
        generation
        variations {
          value
        }
        defaultVariation
        environmentVariations
      }
    `,
    props.data,
  );

  const [commit, isInFlight] = useMutation<IndexPageUpdateFlagMutation>(graphql`
    mutation IndexPageUpdateFlagMutation($input: UpdateFeatureFlagInput!) {
      updateFeatureFlag(input: $input) {
        featureFlag {
          ...IndexPageFlagRow
        }
      }
    }
  `);

  const {env} = useOutletContext<OutletContext>();

  const value =
    flag.variations[
      flag.environmentVariations[env.name] ?? flag.defaultVariation
    ]?.value;
  return (
    <tr>
      <td>
        <PreloadLink to={`/flag/${flag.key}`}>{flag.key}</PreloadLink>
      </td>
      <td>{friendlyType(flag.type)}</td>
      <td>
        <Group noWrap spacing={'xs'}>
          <Flex pos={'relative'}>
            {flag.variations.length <= 1 ? (
              <Button
                style={{
                  pointerEvents: 'none',
                  cursor: 'inherit',
                }}
                radius={'lg'}
                variant="default"
                size="xs">
                {formatValue(flag.type, value)}
              </Button>
            ) : (
              <Menu>
                <Menu.Target>
                  <Box pos="relative">
                    <Button
                      loading={isInFlight}
                      loaderPosition="right"
                      radius={'lg'}
                      variant="default"
                      size="xs"
                      rightIcon={
                        <IconSelector strokeWidth={2} size={'1rem'} />
                      }>
                      {formatValue(flag.type, value)}
                    </Button>
                  </Box>
                </Menu.Target>
                <Menu.Dropdown>
                  {flag.variations.map((v, idx) => {
                    if (idx === flag.defaultVariation) {
                      return null;
                    }
                    return (
                      <Menu.Item
                        key={idx}
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to change ${
                                flag.key
                              } from ${formatValue(
                                flag.type,
                                value,
                              )} to ${formatValue(
                                flag.type,
                                flag.variations[idx].value,
                              )}.`,
                            )
                          ) {
                            commit({
                              variables: {
                                input: {
                                  key: flag.key,
                                  generation: flag.generation,
                                  patch: {
                                    environmentVariations: {
                                      ...flag.environmentVariations,
                                      [env.name]: idx,
                                    },
                                  },
                                },
                              },
                              onError(e) {
                                alert(
                                  // @ts-expect-error: Doesn't like the check for e.source
                                  e.source?.errors?.[0]?.message || e.message,
                                );
                              },
                              onCompleted(_resp, errors) {
                                if (errors) {
                                  alert(
                                    errors?.[0]?.message || 'Unknown error.',
                                  );
                                }
                              },
                            });
                          }
                        }}>
                        {formatValue(flag.type, v.value)}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            )}
          </Flex>
        </Group>
      </td>
      <td>{flag.description ?? <Text fs="italic">none</Text>}</td>
    </tr>
  );
}

function Flags(props: {data: IndexPageFlags$key}) {
  const {data, hasNext, loadNext, isLoadingNext} = usePaginationFragment(
    graphql`
      fragment IndexPageFlags on Viewer
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
        cursor: {type: "String"}
      )
      @refetchable(queryName: "IndexPageFlagsPaginationQuery") {
        featureFlags(first: $count, after: $cursor)
          @connection(key: "IndexPage_featureFlags") {
          edges {
            node {
              key
              ...IndexPageFlagRow
            }
          }
        }
      }
    `,
    props.data,
  );

  if (!data.featureFlags.edges.length) {
    return <PreloadLink to="/flags/create">Create flag</PreloadLink>;
  }

  const {env} = useOutletContext<OutletContext>();

  return (
    <Table style={{tableLayout: 'auto'}} captionSide="bottom">
      <thead>
        <tr>
          <th>Key</th>
          <th>Type</th>
          <th>Current {env.name} value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.featureFlags.edges.map(({node}) => {
          return <FlagRow data={node} key={node.key} />;
        })}
      </tbody>
      {hasNext ? (
        <caption>
          <Flex justify={'center'}>
            <Button
              mt="sm"
              size="xs"
              radius="sm"
              variant="white"
              loading={isLoadingNext}
              loaderPosition="right"
              rightIcon={
                <IconRefresh
                  style={{visibility: 'hidden'}}
                  size="1rem"
                  stroke={2}
                />
              }
              onClick={() => loadNext(25)}>
              Load more
            </Button>
          </Flex>
        </caption>
      ) : null}
    </Table>
  );
}

export function IndexPage() {
  const {rootQuery} = useLoaderData() as LoaderData;
  const data = usePreloadedQuery(
    graphql`
      query IndexPageQuery {
        viewer {
          ...IndexPageFlags @arguments(count: 10)
        }
      }
    `,
    rootQuery,
  );

  return (
    <Container size="sm">
      <Flex direction={'column'}>
        <Title order={2}>Flags</Title>
        <Space h="md" />
        <Flags data={data.viewer} />
      </Flex>
    </Container>
  );
}
