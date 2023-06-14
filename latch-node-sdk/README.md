# latch-node-sdk

Latch provides feature flags backed by Google Storage and kept up-to-date by Google Pub/Sub.

The node sdk provides a client to embed in your node application to get the latest values of your feature flags.

## Installation


```sh
npm install latch-node-sdk
```

or

```sh
yarn add latch-node-sdk
```

or

```sh
pnpm add latch-node-sdk
```

## Usage

Make sure your app has access to [Google Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) with the ability to read from your storage bucket and create subscriptions on your pub/sub topic.

### Create the client

The node sdk supports TypeScript.

```typescript
import {
  LatchClient,
  LatchJsonFlag,
  LatchIntegerFlag,
  LatchStringFlag,
  LatchBooleanFlag,
  LatchFloatFlag,
} from "latch-node-sdk";

const client = new LatchClient<{
  "flag-with-hyphen": LatchJsonFlag;
  my_int_flag: LatchIntegerFlag;
  my_string_flag: LatchStringFlag;
  my_bool_flag: LatchBooleanFlag;
  my_float_flag: LatchFloatFlag;
}>({
  environment: "development",
  bucketName: "your-bucket-name",
  topicName: "your-pubsub-topic-name",
  projectId: "your-google-project-id",
  flags: {
    "flag-with-hyphen": { flagType: "json", defaultValue: { key: "val" } },
    my_int_flag: { flagType: "integer", defaultValue: 2 },
    my_string_flag: { flagType: "string", defaultValue: "default" },
    my_bool_flag: { flagType: "boolean", defaultValue: true },
    my_float_flag: { flagType: "float", defaultValue: 1.5 },
  },
});

client.on("error", (error) => {
  console.error(error);
});

const setupErrors = await client.init();

if (setupErrors) {
  console.error(setupErrors);
}

// on shutdown,
// await client.cleanup();
```

### Get the flag values

```typescript
// Get the current value of the flag.
// If the flag doesn't exist, returns the `defaultValue` provided in the constructor
flagValue = client.flagValue("my_bool_flag");

// Provide a custom default value as the second argument
flagValue = client.flagValue("my_bool_flag", true);

// Subscribe to changes to flags
client.on("flagUpdated", ({key, value, previousValue}) => {
  console.log("%s change from %s to %s", key, previousValue, value);
});
```