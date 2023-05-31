import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Select,
  Space,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  PreloadedQuery,
  graphql,
  loadQuery,
  useFragment,
  useMutation,
  usePaginationFragment,
  usePreloadedQuery,
} from 'react-relay';
import {useLoaderData} from 'react-router-dom';
import {PreloadLink} from './PreloadLink.js';
import {IndexPageFlags$key} from './__generated__/IndexPageFlags.graphql.js';
import type {IndexPageQuery as IndexPageQueryType} from './__generated__/IndexPageQuery.graphql.js';
import IndexPageQuery from './__generated__/IndexPageQuery.graphql.js';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment.js';
import {
  FeatureFlagType,
  IndexPageFlagRow$key,
} from './__generated__/IndexPageFlagRow.graphql.js';
import {useState} from 'react';
import {IconPencil, IconX} from '@tabler/icons-react';
import {formatValue} from './flagFormUtil.js';
import {IndexPageUpdateFlagMutation} from './__generated__/IndexPageUpdateFlagMutation.graphql.js';

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
        currentVariation
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

  const [isEditing, setIsEditing] = useState(false);

  const value = flag.variations[flag.currentVariation]?.value;
  return (
    <tr>
      <td>
        <PreloadLink to={`/flag/${flag.key}`}>{flag.key}</PreloadLink>
      </td>
      <td>{friendlyType(flag.type)}</td>
      <td>
        <Group noWrap spacing={'xs'}>
          {isEditing ? (
            <Flex pos={'relative'}>
              <LoadingOverlay
                visible={isInFlight}
                loaderProps={{
                  size: 'xs',
                  variant: 'dots',
                }}
              />
              <Select
                size="xs"
                data={flag.variations.map((v, idx) => ({
                  value: `${idx}`,
                  label: formatValue(flag.type, v.value),
                }))}
                value={`${flag.currentVariation}`}
                disabled={isInFlight}
                onChange={(v) => {
                  if (v != null) {
                    const idx = parseInt(v, 10);
                    if (
                      idx !== flag.currentVariation &&
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
                              currentVariation: idx,
                            },
                          },
                        },
                        onError(e) {
                          // @ts-expect-error: Doesn't like the check for e.source
                          alert(e.source?.errors?.[0]?.message || e.message);
                        },
                        onCompleted(_resp, errors) {
                          if (errors) {
                            alert(errors?.[0]?.message || 'Unknown error.');
                          } else {
                            setIsEditing(false);
                          }
                        },
                      });
                    }
                  }
                }}
              />
            </Flex>
          ) : (
            formatValue(flag.type, value)
          )}
          <ActionIcon
            size={'xs'}
            disabled={flag.variations.length <= 1}
            onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? <IconX /> : <IconPencil />}
          </ActionIcon>
        </Group>
      </td>
      <td>{flag.description ?? <Text fs="italic">none</Text>}</td>
    </tr>
  );
}

function Flags(props: {data: IndexPageFlags$key}) {
  const {data, hasNext, loadNext, isLoadingNext} = usePaginationFragment(
    graphql`
      fragment IndexPageFlags on Query
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

  return (
    <Table style={{tableLayout: 'auto'}} captionSide="bottom">
      <thead>
        <tr>
          <th>Key</th>
          <th>Type</th>
          <th>Current value</th>
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
          <Flex justify={'right'}>
            <Button
              variant="default"
              loading={isLoadingNext}
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
        ...IndexPageFlags @arguments(count: 10)
      }
    `,
    rootQuery,
  );

  return (
    <Container size="sm">
      <Flex direction={'column'}>
        <Title order={2}>Flags</Title>
        <Space h="md" />
        <Flags data={data} />
      </Flex>
    </Container>
  );
}
