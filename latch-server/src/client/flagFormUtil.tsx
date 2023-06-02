import {JsonInput, NumberInput, Select, TextInput} from '@mantine/core';
import {FeatureFlagType} from './__generated__/NewFlagPageCreateFlagMutation.graphql';

export function formatValue(type: FeatureFlagType, value: any): string {
  switch (type) {
    case 'BOOL':
    case 'FLOAT':
    case 'INT':
      return JSON.stringify(value);
    case 'STRING':
      return value === '' ? '""' : value;
    case 'JSON':
      return value;
    case '%future added value':
      return value;
    default:
      return value;
  }
}

export function friendlyType(type: FeatureFlagType): string {
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

export function defaultValue(type: FeatureFlagType, alt?: boolean): any {
  switch (type) {
    case 'BOOL':
      return alt ? false : true;
    case 'FLOAT':
      return alt ? 2.0 : 1.0;
    case 'INT':
      return alt ? 2 : 1;
    case 'STRING':
      return '';
    case 'JSON':
      return '{"key": "value"}';
    case '%future added value':
      return '';
  }
}

export function inputForType(
  type: FeatureFlagType,
  inputProps: any,
): React.ReactElement {
  switch (type) {
    case 'BOOL':
      return (
        <Select
          label="Value"
          data={[
            {label: 'true', value: true},
            {label: 'false', value: false},
          ]}
          {...inputProps}
        />
      );
    case 'FLOAT':
      return <NumberInput label="Value" {...inputProps} />;
    case 'INT':
      return <NumberInput label="Value" precision={0} {...inputProps} />;
    case 'STRING':
      return <TextInput label="Value" {...inputProps} />;
    case 'JSON':
      return <JsonInput label="Value" autosize {...inputProps} />;
    case '%future added value':
    default:
      return <TextInput label="Value" {...inputProps} />;
  }
}
