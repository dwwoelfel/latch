import {
  ActionIcon,
  Box,
  Button,
  ColorSwatch,
  Container,
  Divider,
  Flex,
  Group,
  Select,
  Space,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {IconTrash} from '@tabler/icons-react';
import {useEffect, useState} from 'react';
import type {PreloadedQuery} from 'react-relay';
import {graphql} from 'react-relay';
import {loadQuery, useMutation, usePreloadedQuery} from './react-relay';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {
  FeatureFlagType,
  NewFlagPageCreateFlagMutation,
} from './__generated__/NewFlagPageCreateFlagMutation.graphql';
import {
  defaultValue,
  formatValue,
  friendlyType,
  inputForType,
} from './flagFormUtil';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import type {NewFlagPageQuery as NewFlagPageQueryType} from './__generated__/NewFlagPageQuery.graphql';
import NewFlagPageQuery from './__generated__/NewFlagPageQuery.graphql';

type LoaderData = {
  rootQuery: PreloadedQuery<NewFlagPageQueryType>;
};

export const loader = (environment: RelayModernEnvironment): LoaderData => {
  return {
    rootQuery: loadQuery(
      environment,
      NewFlagPageQuery,
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

export function NewFlagPage() {
  const {rootQuery} = useLoaderData() as LoaderData;
  const data = usePreloadedQuery(
    graphql`
      query NewFlagPageQuery {
        viewer {
          environments {
            name
            color
          }
        }
      }
    `,
    rootQuery,
  );

  const [commit, isInFlight] =
    useMutation<NewFlagPageCreateFlagMutation>(graphql`
      mutation NewFlagPageCreateFlagMutation($input: CreateFeatureFlagInput!) {
        createFeatureFlag(input: $input) {
          featureFlag {
            key
          }
        }
      }
    `);

  const [saveError, setSaveError] = useState<string | null>(null);

  const makeInitialVariations = (type: FeatureFlagType) => {
    const initialEnvironmentVariations: {[key: string]: number} = {};
    for (const env of data.viewer.environments) {
      initialEnvironmentVariations[env.name] = 0;
    }

    return {
      defaultVariation: 0,
      variations: [{value: defaultValue(type), description: ''}],
      environmentVariations: initialEnvironmentVariations,
    };
  };

  const form = useForm<{
    key: string;
    type: FeatureFlagType;
    description: string;
    variationsByType: {
      [key in FeatureFlagType]: {
        variations: {value: any; description: string}[];
        defaultVariation: number;
        environmentVariations: {
          [key: string]: number;
        };
      };
    };
  }>({
    initialValues: {
      key: '',
      type: 'BOOL',
      description: '',
      variationsByType: {
        BOOL: makeInitialVariations('BOOL'),
        INT: makeInitialVariations('INT'),
        FLOAT: makeInitialVariations('FLOAT'),
        STRING: makeInitialVariations('STRING'),
        JSON: makeInitialVariations('JSON'),
        // Make the type-checker happy. Won't see this in practice because
        // we control the select options
        '%future added value': {
          defaultVariation: 0,
          variations: [],
          environmentVariations: {},
        },
      },
    },
    validate: {
      key(value) {
        if (value.length > 1024) {
          return 'Key must be fewer than 1024 characters.';
        }
        if (!value.match(/^[A-Za-z0-9_-]+$/)) {
          return 'Key can only contain letters, numbers, underscores, and hyphens.';
        }
      },
    },
  });

  useEffect(() => {
    setSaveError(null);
  }, [form.values]);

  useEffect(() => {
    const {variations, defaultVariation, environmentVariations} =
      form.values.variationsByType[form.values.type];

    if (defaultVariation !== 0 && variations.length < defaultVariation) {
      form.setFieldValue(
        `variationsByType.${form.values.type}.defaultVariation`,
        0,
      );
    }

    for (const [key, value] of Object.entries(environmentVariations)) {
      if (value !== 0 && variations.length < value) {
        form.setFieldValue(
          `variationsByType.${form.values.type}.environmentVariations.${key}`,
          0,
        );
      }
    }
  }, [form]);

  const availableTypes: FeatureFlagType[] = [
    'BOOL',
    'INT',
    'FLOAT',
    'STRING',
    'JSON',
  ];

  const {variations} = form.values.variationsByType[form.values.type];

  const navigate = useNavigate();

  return (
    <Container size="sm">
      <Flex direction={'column'}>
        <Title order={3}>Create flag</Title>
        <Space h="md" />

        <form
          onSubmit={form.onSubmit((values) => {
            const input = {
              key: values.key,
              description:
                values.description === '' ? null : values.description,
              variations: values.variationsByType[values.type].variations,
              type: values.type,
              defaultVariation:
                values.variationsByType[values.type].defaultVariation,
              environmentVariations:
                values.variationsByType[values.type].environmentVariations,
            };
            commit({
              variables: {input},
              onError(e) {
                // @ts-expect-error: Doesn't like the check for e.source
                setSaveError(e.source?.errors?.[0]?.message || e.message);
              },
              onCompleted(resp, errors) {
                if (errors) {
                  setSaveError(errors?.[0]?.message || 'Unknown error.');
                } else {
                  const key = resp.createFeatureFlag.featureFlag.key;
                  navigate(`/flag/${key}`);
                }
              },
            });
          })}>
          <TextInput
            label="Key"
            placeholder="my_flag"
            description="The unique key used to look up the feature flag. Letters, numbers, hyphens, and underscores are allowed."
            required
            {...form.getInputProps('key')}
          />
          <Space h="sm" />
          <Select
            label="Type"
            description="The type of the feature flag value. It can't be changed after it's created."
            required
            data={availableTypes.map((value: FeatureFlagType) => {
              return {
                value: value,
                label: friendlyType(value),
              };
            })}
            {...form.getInputProps('type')}
          />
          <Space h="sm" />
          <Textarea
            label="Description"
            autosize
            placeholder=""
            {...form.getInputProps('description')}
          />
          <Space h="sm" />

          <Divider label="Variations" />
          {variations.map((_item, idx) => {
            const baseKey = `variationsByType.${form.values.type}.variations`;
            const inputProps = (key: string) =>
              form.getInputProps(`${baseKey}.${idx}.${key}`);

            return (
              <Group key={`${form.values.type}-${idx}`} mt="xs">
                {inputForType(form.values.type, inputProps('value'))}
                <TextInput
                  label="Description"
                  placeholder="Description"
                  {...inputProps('description')}
                />
                {variations.length > 1 ? (
                  <ActionIcon onClick={() => form.removeListItem(baseKey, idx)}>
                    <IconTrash />
                  </ActionIcon>
                ) : null}
              </Group>
            );
          })}
          <Space h="sm" />
          <Button
            variant="outline"
            onClick={() =>
              form.insertListItem(
                `variationsByType.${form.values.type}.variations`,
                {
                  value: defaultValue(form.values.type, true),
                  description: '',
                },
              )
            }>
            Add variation
          </Button>
          <Space h="md" />
          <Select
            label="Default variation"
            description="The variation that will be used if a new environment is created in the future."
            // @ts-expect-error: it doesn't like that I use a number for value, but it seems to work
            data={variations.map((v, idx) => ({
              value: idx,
              label: formatValue(form.values.type, v.value),
            }))}
            {...form.getInputProps(
              `variationsByType.${form.values.type}.defaultVariation`,
            )}
          />

          {data.viewer.environments.map((env) => {
            return (
              <Box key={env.name}>
                <Space h="md" />
                <Select
                  description={`The variation that will be used in the ${env.name} environment.`}
                  label={
                    <Group spacing="0.5rem" align="center">
                      <ColorSwatch size="1rem" color={env.color} />
                      <Text>{env.name} variation</Text>
                    </Group>
                  }
                  // @ts-expect-error: it doesn't like that I use a number for value, but it seems to work
                  data={variations.map((v, idx) => ({
                    value: idx,
                    label: formatValue(form.values.type, v.value),
                  }))}
                  {...form.getInputProps(
                    `variationsByType.${form.values.type}.environmentVariations.${env.name}`,
                  )}
                />
              </Box>
            );
          })}

          {saveError ? (
            <Text mt={'md'} color="red" size={'sm'}>
              Could not save flag. {saveError}
            </Text>
          ) : null}
          <Group position="right" mt="md">
            <Button loading={isInFlight} type="submit">
              Save flag
            </Button>
          </Group>
        </form>
      </Flex>
    </Container>
  );
}
