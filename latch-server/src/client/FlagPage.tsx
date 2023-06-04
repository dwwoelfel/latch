import {
  ActionIcon,
  Box,
  Button,
  Code,
  ColorSwatch,
  Container,
  Flex,
  Group,
  Select,
  Skeleton,
  Space,
  Stack,
  Table,
  Text,
  Textarea,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {IconRefresh, IconTrash} from '@tabler/icons-react';
import {
  differenceInSeconds,
  format,
  formatDistanceToNow,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday,
} from 'date-fns';
import {Suspense, useEffect, useState} from 'react';
import type {PreloadedQuery} from 'react-relay';
import {graphql} from 'react-relay';
import {
  loadQuery,
  useFragment,
  useMutation,
  usePaginationFragment,
  usePreloadedQuery,
} from './react-relay';
import {LoaderFunctionArgs, useLoaderData} from 'react-router-dom';
import {stableCopy} from './relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment.js';
import {
  FeatureFlagType,
  FlagPageFlag$data,
  FlagPageFlag$key,
} from './__generated__/FlagPageFlag.graphql.js';
import {FlagPageHistory$key} from './__generated__/FlagPageHistory.graphql.js';
import type {FlagPageQuery as FlagPageQueryType} from './__generated__/FlagPageQuery.graphql.js';
import FlagPageQuery from './__generated__/FlagPageQuery.graphql.js';
import {FlagPageUpdateFlagMutation} from './__generated__/FlagPageUpdateFlagMutation.graphql.js';
import {
  defaultValue,
  formatValue,
  friendlyType,
  inputForType,
} from './flagFormUtil.js';
import {
  FlagPageEnvironments$data,
  FlagPageEnvironments$key,
} from './__generated__/FlagPageEnvironments.graphql.js';

//import graphql from 'babel-plugin-relay/macro';

type LoaderData = {
  rootQuery: PreloadedQuery<FlagPageQueryType>;
};

export const loader = (
  environment: RelayModernEnvironment,
  props: LoaderFunctionArgs,
): LoaderData => {
  const key = props.params.key as string;
  return {
    rootQuery: loadQuery(
      environment,
      FlagPageQuery,
      {key},
      {
        fetchPolicy: 'store-or-network',
      },
    ),
  };
};

function FlagDetail({
  flag,
  viewer,
}: {
  flag: FlagPageFlag$data;
  viewer: FlagPageEnvironments$data;
}) {
  const [commit, isInFlight] = useMutation<FlagPageUpdateFlagMutation>(graphql`
    mutation FlagPageUpdateFlagMutation($input: UpdateFeatureFlagInput!) {
      updateFeatureFlag(input: $input) {
        featureFlag {
          ...IndexPageFlagRow
          ...FlagPageFlag
        }
      }
    }
  `);

  const value = flag.variations[flag.defaultVariation]?.value;

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialValues = {
    variations: flag.variations.map((v) => ({
      value: v.value,
      description: v.description,
    })),
    defaultVariation: flag.defaultVariation,
    environmentVariations: {...flag.environmentVariations},
    description: flag.description || '',
  };
  const form = useForm({
    initialValues: initialValues,
  });

  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    form.setValues(initialValues);
    form.resetDirty();
    // TODO: Hook should complain about this
  }, [resetSignal]);

  useEffect(() => {
    setSaveError(null);
  }, [form.values]);

  useEffect(() => {
    const {variations, defaultVariation, environmentVariations} = form.values;

    if (defaultVariation !== 0 && variations.length < defaultVariation) {
      form.setFieldValue('defaultVariation', 0);
    }

    for (const [key, value] of Object.entries(environmentVariations)) {
      if (value !== 0 && variations.length < value) {
        form.setFieldValue(`environmentVariations.${key}`, 0);
      }
    }
  }, [form]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        setSaveError(null);
        const input = {
          key: flag.key,
          generation: flag.generation,
          patch: {
            description: values.description === '' ? null : values.description,
            variations: values.variations,
            defaultVariation: values.defaultVariation,
            environmentVariations: values.environmentVariations,
          },
        };
        commit({
          variables: {input},
          onError(e) {
            console.error('error', e);
            // @ts-expect-error: Doesn't like the check for e.source
            setSaveError(e.source?.errors?.[0]?.message || e.message);
          },
          onCompleted(_resp, errors) {
            if (errors) {
              setSaveError(errors?.[0]?.message || 'Unknown error.');
            } else {
              setIsEditing(false);
              setResetSignal((i) => i + 1);
            }
          },
        });
      })}>
      {' '}
      <Stack>
        <Box>
          <Text fz="sm" fw="bold">
            Key
          </Text>
          <Text>{flag.key}</Text>
        </Box>
        <Box>
          <Text fz="sm" fw="bold">
            Type
          </Text>
          <Text>{friendlyType(flag.type)}</Text>
        </Box>
        <Box>
          <Text fz="sm" fw="bold">
            Description
          </Text>
          {isEditing ? (
            <Textarea {...form.getInputProps('description')} />
          ) : (
            <Text fs={flag.description ? '' : 'italic'}>
              {flag.description || 'none'}
            </Text>
          )}
        </Box>
        <Box>
          <Text fz="sm" fw="bold">
            Default variation
          </Text>
          {isEditing ? (
            <Select
              // @ts-expect-error: it doesn't like that I use a number for value, but it seems to work
              data={form.values.variations.map((v, idx) => ({
                value: idx,
                label: formatValue(flag.type, v.value),
              }))}
              {...form.getInputProps('defaultVariation')}
            />
          ) : (
            <Text>{formatValue(flag.type, value)}</Text>
          )}
        </Box>
        {viewer.environments.map((env) => {
          return (
            <Box key={env.name}>
              <Text fz="sm" fw="bold">
                {env.name} variation
              </Text>
              {isEditing ? (
                <Select
                  // @ts-expect-error: it doesn't like that I use a number for value, but it seems to work
                  data={form.values.variations.map((v, idx) => ({
                    value: idx,
                    label: formatValue(flag.type, v.value),
                  }))}
                  {...form.getInputProps(`environmentVariations.${env.name}`)}
                />
              ) : (
                <Text>
                  {formatValue(
                    flag.type,
                    flag.variations[
                      flag.environmentVariations[env.name] ??
                        flag.defaultVariation
                    ]?.value,
                  )}
                </Text>
              )}
            </Box>
          );
        })}

        <Box>
          <Text fz="sm" fw="bold">
            Variations
          </Text>
          <Table style={{tableLayout: 'auto'}} captionSide="bottom">
            <thead>
              <tr>
                <th>Value</th>
                <th>Description</th>
                {isEditing ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? form.values.variations : flag.variations).map(
                (v, idx) => {
                  return (
                    <tr key={idx}>
                      {isEditing ? (
                        <td>
                          {inputForType(flag.type, {
                            ...form.getInputProps(`variations.${idx}.value`),
                            label: undefined,
                          })}
                        </td>
                      ) : (
                        <td>
                          <Group spacing={'xs'}>
                            {formatValue(flag.type, v.value)}{' '}
                            {viewer.environments.flatMap((env) => {
                              const envVariation =
                                flag.environmentVariations[env.name] ??
                                flag.defaultVariation;
                              const dot = (
                                <Tooltip
                                  key={env.name}
                                  label={`This variation is being served in ${env.name}`}>
                                  <ColorSwatch size="1rem" color={env.color} />
                                </Tooltip>
                              );
                              return envVariation === idx ? [dot] : [];
                            })}
                          </Group>
                        </td>
                      )}
                      <td>
                        {isEditing ? (
                          <Textarea
                            autosize
                            {...form.getInputProps(
                              `variations.${idx}.description`,
                            )}
                          />
                        ) : (
                          <Text fs={v.description ? '' : 'italic'}>
                            {v.description || 'none'}
                          </Text>
                        )}
                      </td>
                      {isEditing ? (
                        <td>
                          {form.values.variations.length > 1 ? (
                            <ActionIcon
                              onClick={() =>
                                form.removeListItem('variations', idx)
                              }>
                              <IconTrash />
                            </ActionIcon>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                },
              )}
            </tbody>
          </Table>
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() =>
                form.insertListItem('variations', {
                  value: defaultValue(flag.type),
                  description: '',
                })
              }>
              Add variation
            </Button>
          ) : null}
        </Box>
        <Group position={isEditing ? 'right' : 'left'}>
          {isEditing ? (
            <>
              {saveError ? (
                <Text mt={'md'} color="red" size={'sm'}>
                  Could not save flag. {saveError}
                </Text>
              ) : null}
              <Tooltip
                disabled={form.isDirty()}
                label="Make a change before saving.">
                <Button
                  // Tooltip doesn't work if button is disabled,
                  // so we'll try to mimic the disabled state by hand
                  style={form.isDirty() ? {} : {cursor: 'inherit'}}
                  variant={form.isDirty() ? 'filled' : 'light'}
                  color={form.isDirty() ? undefined : 'gray'}
                  onClick={
                    form.isDirty()
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                  }
                  loading={isInFlight}
                  type="submit">
                  Save
                </Button>
              </Tooltip>
              <Button
                variant="default"
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="default" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </Group>
      </Stack>
    </form>
  );
}

type FlagForDiffVariation = {
  readonly value: any;
  readonly description: string | null | undefined;
};

type FlagForDiff = {
  readonly description: string | undefined | null;
  readonly defaultVariation: number;
  readonly variations: readonly FlagForDiffVariation[];
  readonly environmentVariations: Record<string, number>;
};

type UpdateType = 'value' | 'variations' | 'description';

function toSentence(a: string[]): string {
  if (a.length === 0) return '';
  else if (a.length === 1) return a[0];
  else if (a.length === 2) return a.join(' and ');
  else return a.slice(0, -1).join(', ') + ', and ' + a.slice(-1);
}

function formatUpdateTypes(updateTypes: Set<UpdateType>) {
  const vs = [];
  // Order by importance
  if (updateTypes.has('value')) {
    vs.push('value');
  }
  if (updateTypes.has('variations')) {
    vs.push('variations');
  }
  if (updateTypes.has('description')) {
    vs.push('description');
  }
  if (!vs.length) {
    return 'Updated flag';
  } else {
    return `Updated ${toSentence(vs)}`;
  }
}

//NEXTUP Handle changes in environment values
function flagDiffs(
  type: FeatureFlagType,
  environments: readonly {readonly name: string; readonly color: string}[],
  a: FlagForDiff,
  b: FlagForDiff,
): {
  updateTypes: Set<UpdateType>;
  diffs: React.ReactElement[];
} {
  const aValue = a.variations[a.defaultVariation]?.value;
  const bValue = b.variations[b.defaultVariation]?.value;

  const diffs = [];
  const updateTypes = new Set<UpdateType>();

  if (JSON.stringify(aValue) !== JSON.stringify(bValue)) {
    updateTypes.add('value');
    diffs.push(
      <Text>
        Default value changed from <Code>{formatValue(type, aValue)}</Code> to{' '}
        <Code>{formatValue(type, bValue)}</Code>.
      </Text>,
    );
  }

  for (const env of environments) {
    const aVal =
      a.variations[a.environmentVariations[env.name] ?? a.defaultVariation]
        ?.value;
    const bVal =
      b.variations[b.environmentVariations[env.name] ?? b.defaultVariation]
        ?.value;
    if (JSON.stringify(aVal) !== JSON.stringify(bVal)) {
      updateTypes.add('value');
      diffs.push(
        <Group spacing={'0.5em'}>
          <ColorSwatch color={env.color} size={'0.8em'} />
          <Text>
            Value for {env.name} changed from{' '}
            <Code>{formatValue(type, aVal)}</Code> to{' '}
            <Code>{formatValue(type, bVal)}</Code>.
          </Text>
        </Group>,
      );
    }
  }

  if (a.description !== b.description) {
    updateTypes.add('description');
    diffs.push(
      <Text>
        Description changed from{' '}
        {a.description ? (
          <Code>{a.description}</Code>
        ) : (
          <Text component="span" fs="italic">
            none
          </Text>
        )}{' '}
        to{' '}
        {b.description ? (
          <Code>{b.description}</Code>
        ) : (
          <Text component="span" fs="italic">
            none
          </Text>
        )}
      </Text>,
    );
  }

  if (
    JSON.stringify(stableCopy(a.variations)) !==
    JSON.stringify(stableCopy(b.variations))
  ) {
    updateTypes.add('variations');
    const aMap = new Map<string, FlagForDiffVariation[]>();
    const bMap = new Map<string, FlagForDiffVariation[]>();
    for (const v of a.variations) {
      const k = JSON.stringify(stableCopy(v.value));
      const l = aMap.get(k) || [];
      l.push(v);
      aMap.set(k, l);
    }
    for (const v of b.variations) {
      const k = JSON.stringify(stableCopy(v.value));
      const l = bMap.get(k) || [];
      l.push(v);
      bMap.set(k, l);
    }

    const aKeys = new Set(aMap.keys());
    const bKeys = new Set(bMap.keys());
    let foundVariationChange;
    for (const removed of [...aKeys].filter((k) => !bKeys.has(k))) {
      for (const variation of aMap.get(removed) || []) {
        foundVariationChange = true;
        diffs.push(
          <Text>
            Removed variation with value{' '}
            <Code>{formatValue(type, variation.value)}</Code>.
          </Text>,
        );
      }
    }
    for (const added of [...bKeys].filter((k) => !aKeys.has(k))) {
      for (const variation of bMap.get(added) || []) {
        foundVariationChange = true;
        diffs.push(
          <Text>
            Added variation with value{' '}
            <Code>{formatValue(type, variation.value)}</Code>.
          </Text>,
        );
      }
    }

    for (const k of [...aKeys].filter((k) => bKeys.has(k))) {
      const aDesc = (aMap.get(k) || []).map((a) => a.description).sort();
      const bDesc = (bMap.get(k) || []).map((b) => b.description).sort();

      if (aDesc.length > bDesc.length) {
        foundVariationChange = true;
        diffs.push(
          <Text>
            Removed variations with value{' '}
            <Code>{formatValue(type, aMap.get(k)?.[0].value)}</Code>.
          </Text>,
        );
      } else if (bDesc.length > aDesc.length) {
        foundVariationChange = true;
        diffs.push(
          <Text>
            Added variations with value{' '}
            <Code>{formatValue(type, aMap.get(k)?.[0].value)}</Code>.
          </Text>,
        );
      } else if (aDesc.join('__') !== bDesc.join('__')) {
        foundVariationChange = true;
        diffs.push(
          <Text>
            Changed descriptions for variations with value{' '}
            <Code>{formatValue(type, aMap.get(k)?.[0].value)}</Code>.
          </Text>,
        );
      }
    }

    if (!foundVariationChange) {
      console.warn("Couldn't figure out variation difference between", a, b);
      diffs.push(<Text>Variations changed.</Text>);
    }
  }
  if (!diffs.length) {
    console.warn('Could not find difference between', a, b);
  }
  return {diffs, updateTypes};
}

function FlagHistory(props: {
  flag: FlagPageHistory$key;
  viewer: FlagPageEnvironments$data;
}) {
  const {
    data: flag,
    hasNext,
    loadNext,
    isLoadingNext,
  } = usePaginationFragment(
    graphql`
      fragment FlagPageHistory on FeatureFlag
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 5}
        cursor: {type: "String"}
      )
      @refetchable(queryName: "FlagPageHistoryPaginationQuery") {
        previousVersions(first: $count, after: $cursor)
          @connection(key: "FlagPage_previousVersions") {
          edges {
            cursor
            node {
              description
              variations {
                value
                description
              }
              defaultVariation
              environmentVariations
              timeDeleted
            }
          }
        }
        type
        description
        variations {
          value
          description
        }
        defaultVariation
        environmentVariations
      }
    `,
    props.flag,
  );

  const [_now, setNow] = useState(Date.now());

  const firstVersion = flag.previousVersions.edges[0];

  useEffect(() => {
    if (firstVersion) {
      const firstVersionDate = new Date(firstVersion.node.timeDeleted);
      const nextTimeout = () => {
        const diff = differenceInSeconds(new Date(), firstVersionDate);
        if (diff < 60 /* minute */) {
          return 1000; /* second */
        } else if (diff < 60 * 60 /* hour */) {
          return 1000 * 60; /* minute */
        } else if (diff < 60 * 60 * 24 * 7 /* week */) {
          return 1000 * 60 * 60; /* hour */
        } else {
          return 1000 * 60 * 60 * 24; /* day */
        }
      };
      const timeoutFn = () => {
        setNow(Date.now());
        const waitMs = nextTimeout();
        timeout = setTimeout(timeoutFn, waitMs);
      };
      let timeout = setTimeout(timeoutFn, nextTimeout());
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [firstVersion]);

  if (flag.previousVersions.edges.length === 0) {
    return <Text fs="italic">No history.</Text>;
  }

  return (
    <>
      <Timeline lineWidth={2} bulletSize={12} color="gray">
        {flag.previousVersions.edges.map((edge, idx) => {
          const next =
            idx === 0 ? flag : flag.previousVersions.edges[idx - 1].node;
          const {node, cursor} = edge;
          const {diffs, updateTypes} = flagDiffs(
            flag.type,
            props.viewer.environments,
            node,
            next,
          );
          const editedAt = new Date(node.timeDeleted);
          let formattedDate;
          if (isToday(editedAt)) {
            formattedDate = format(editedAt, "'Today at' h:mm bbb");
          } else if (isYesterday(editedAt)) {
            formattedDate = format(editedAt, "'Yesterday at' h:mm bbb");
          } else if (isThisWeek(editedAt)) {
            formattedDate = format(editedAt, "EEEE 'at' h:mm bbb");
          } else if (isThisYear(editedAt)) {
            formattedDate = format(editedAt, "MMMM do 'at' h:mm bbb");
          } else {
            formattedDate = format(editedAt, "MMMM do, yyyy 'at' h:mm bbb");
          }

          return (
            <Timeline.Item key={cursor} title={formatUpdateTypes(updateTypes)}>
              {diffs.length === 0 ? (
                <Text color="dimmed" size="sm" key={idx} fs="italic">
                  No change detected.
                </Text>
              ) : null}

              {diffs.map((d, idx) => (
                <Text color="dimmed" size="sm" key={idx}>
                  {d}
                </Text>
              ))}

              <Text size="xs" mt={4} title={node.timeDeleted}>
                {formattedDate} (
                {formatDistanceToNow(editedAt, {includeSeconds: true})} ago)
              </Text>
            </Timeline.Item>
          );
        })}
      </Timeline>
      <Box>
        {hasNext ? (
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
        ) : null}
      </Box>
    </>
  );
}

function Flag(props: {
  flag: FlagPageFlag$key;
  viewer: FlagPageEnvironments$key;
}) {
  const viewer = useFragment(
    graphql`
      fragment FlagPageEnvironments on Viewer {
        environments {
          name
          color
        }
      }
    `,
    props.viewer,
  );
  const flag = useFragment(
    graphql`
      fragment FlagPageFlag on FeatureFlag {
        key
        generation
        type
        description
        variations {
          value
          description
        }
        defaultVariation
        environmentVariations
        ...FlagPageHistory
      }
    `,
    props.flag,
  );

  return (
    <>
      <FlagDetail flag={flag} viewer={viewer} />
      <Space h="xl" />
      <Title order={4}>History</Title>
      <Space h="md" />
      <FlagHistory flag={flag} viewer={viewer} />
      <Space h="xl" />
    </>
  );
}

function FlagContainer() {
  const {rootQuery} = useLoaderData() as LoaderData;
  const data = usePreloadedQuery(
    graphql`
      query FlagPageQuery($key: String!) {
        viewer {
          ...FlagPageEnvironments
          featureFlag(key: $key) {
            ...FlagPageFlag
          }
        }
      }
    `,
    rootQuery,
  );

  const flag = data.viewer.featureFlag;

  if (!flag) {
    return <Text>Feature flag not found.</Text>;
  }
  return <Flag flag={flag} viewer={data.viewer} />;
}

export function FlagPage() {
  return (
    <Container size="sm">
      <Flex direction={'column'}>
        <Title order={2}>Flag</Title>
        <Space h="md" />
        <Suspense
          fallback={
            <Skeleton>
              <FlagDetail
                flag={{
                  key: '',
                  generation: '',
                  description: '',
                  type: 'BOOL',
                  variations: [{value: '', description: ''}],
                  defaultVariation: 0,
                  environmentVariations: {},
                  ' $fragmentType': 'FlagPageFlag',
                  ' $fragmentSpreads': {FlagPageHistory: true},
                }}
                viewer={{
                  environments: [],
                  ' $fragmentType': 'FlagPageEnvironments',
                }}
              />
            </Skeleton>
          }>
          <FlagContainer />
        </Suspense>
      </Flex>
    </Container>
  );
}
