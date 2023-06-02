import {Button, ColorInput, Space, TextInput, Text} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useEffect, useState} from 'react';
import {graphql, useMutation} from 'react-relay';
import {CreateEnvironmentFormMutation} from './__generated__/CreateEnvironmentFormMutation.graphql';
import {useNavigate} from 'react-router-dom';

const defaultColors: {[key: string]: string} = {
  p: '#cd5c5c',
  prod: '#cd5c5c',
  production: '#cd5c5c',
  s: '#fde680',
  stag: '#fde680',
  staging: '#fde680',
  d: '#87ceeb',
  dev: '#87ceeb',
  development: '#87ceeb',
};

const defaultColorValues = new Set(Object.values(defaultColors));
defaultColorValues.add('#ffffff');

export function CreateEnvironmentForm() {
  const [commit, isInFlight] = useMutation<CreateEnvironmentFormMutation>(
    graphql`
      mutation CreateEnvironmentFormMutation($input: CreateEnvironmentInput!) {
        createEnvironment(input: $input) {
          environment {
            name
          }
          viewer {
            ...AppEnvironmentSelector
          }
        }
      }
    `,
  );
  const form = useForm({
    initialValues: {
      name: '',
      color: '#ffffff',
    },
  });

  useEffect(() => {
    const colorInput = form.values.color;
    // Set a good default for the environment
    if (!colorInput || defaultColorValues.has(colorInput)) {
      const color = defaultColors[form.values.name];
      if (color && color !== form.values.color) {
        form.setFieldValue('color', color);
      }
    }
  }, [form]);

  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSaveError(null);
  }, [form.values]);

  const navigate = useNavigate();

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const input = {
          name: values.name,
          color: values.color,
        };
        commit({
          variables: {input},
          onError(e) {
            // @ts-expect-error: Doesn't like the check for e.source
            setSaveError(e.source?.errors?.[0]?.message || e.message);
          },
          onCompleted(_resp, errors) {
            if (errors) {
              setSaveError(errors?.[0]?.message || 'Unknown error.');
            } else {
              form.reset();
              navigate(`/?environment=${values.name}`);
            }
          },
        });
      })}>
      <TextInput
        required
        label="Name"
        placeholder="Name e.g. production"
        {...form.getInputProps('name')}
      />
      <ColorInput label="Color" {...form.getInputProps('color')} />
      {saveError ? (
        <Text mt={'md'} color="red" size={'sm'}>
          Could not create environment. {saveError}
        </Text>
      ) : null}
      <Space h="md" />
      <Button loading={isInFlight} type="submit">
        Create environment
      </Button>
    </form>
  );
}
