import {
  ActionIcon,
  Button,
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
import {graphql, useMutation} from 'react-relay';
import {useNavigate} from 'react-router-dom';
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

export function NewFlagPage() {
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

  const form = useForm<{
    key: string;
    type: FeatureFlagType;
    description: string;
    variationsByType: {
      [key in FeatureFlagType]: {
        variations: {value: any; description: string}[];
        currentVariation: number;
      };
    };
  }>({
    initialValues: {
      key: '',
      type: 'BOOL',
      description: '',
      variationsByType: {
        BOOL: {
          currentVariation: 0,
          variations: [
            {value: true, description: ''},
            {value: false, description: ''},
          ],
        },
        INT: {
          currentVariation: 0,
          variations: [{value: defaultValue('INT'), description: ''}],
        },
        FLOAT: {
          currentVariation: 0,
          variations: [{value: defaultValue('FLOAT'), description: ''}],
        },
        STRING: {
          currentVariation: 0,
          variations: [{value: defaultValue('STRING'), description: ''}],
        },
        JSON: {
          currentVariation: 0,
          variations: [{value: defaultValue('JSON'), description: ''}],
        },
        // Make the type-checker happy. Won't see this in practice because
        // we control the select options
        '%future added value': {
          currentVariation: 0,
          variations: [],
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
    const {variations, currentVariation} =
      form.values.variationsByType[form.values.type];

    if (currentVariation !== 0 && variations.length < currentVariation) {
      form.setFieldValue(
        `variationsByType.${form.values.type}.currentVariation`,
        0,
      );
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
              currentVariation:
                values.variationsByType[values.type].currentVariation,
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
            required
            {...form.getInputProps('key')}
          />
          <Space h="sm" />
          <Select
            label="Type"
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
                  value: defaultValue(form.values.type),
                  description: '',
                },
              )
            }>
            Add variation
          </Button>
          <Space h="md" />
          <Select
            label="Current variation"
            // @ts-expect-error: it doesn't like that I use a number for value, but it seems to work
            data={variations.map((v, idx) => ({
              value: idx,
              label: formatValue(form.values.type, v.value),
            }))}
            {...form.getInputProps(
              `variationsByType.${form.values.type}.currentVariation`,
            )}
          />
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
