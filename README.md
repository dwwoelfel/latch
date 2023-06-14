# Latch

Latch is a self-hosted feature flagging tool built on top of Google Storage.

It uses Google Storage as the backend for storing flags and subscribes to changes to the flags using Google Pub/Sub.

There are two packages in the repo.

[`latch-server`](https://github.com/dwwoelfel/latch/tree/main/latch-server) houses the UI for managing and updating feature flags.

[`latch-node-sdk`](https://github.com/dwwoelfel/latch/tree/main/latch-node-sdk) houses the node client that should be embedded in your app.



https://github.com/dwwoelfel/latch/assets/476818/5ec44348-93a9-4dbe-851c-ae85d835260f



## Why Google Storage

Google storage has a few features that make it well-suited as the backend for feature flagging:

Objects in Google storage have "generation" ids. These are int64s that increase each time a file in Google storage is updated. Before we make a change to a flag in the UI, we first check that the value we're updating from is the current generation. This prevents us from accidentally overwriting changes or making decisions based on stale data.

Storage buckets can enable object versioning, which will store every previous version of a flag. This gives us a way to generate a history of every change made to a flag.

Subscriptions to flag changes are provided by [Pub/Sub notifications for Cloud Storage](https://cloud.google.com/storage/docs/pubsub-notifications). We create a single pub/sub topic that subscribes to changes in Google Storage, then each client creates its own subscription to the topic.

## Implementation

Each flag is stored as a separate file in Google Storage with a set of variations and an index to the current variation for each environment.

Here is an example of a file stored in Google Storage:

```json
{
  "key": "favorite_seinfeld_character",
  "type": "string",
  "variations": [
    {
      "description": "Was that wrong?",
      "value": "george"
    },
    {
      "description": "I don't wanna be a pirate.",
      "value": "jerry"
    },
    {
      "description": "So you think you're spongeworthy?",
      "value": "elaine"
    },
    {
      "description": "These pretzels are making me thirsty.",
      "value": "kramer"
    }
  ],
  "defaultVariation": 0,
  "description": "How can you choose just one?",
  "environmentVariations": {
    "development": 1,
    "production": 2,
    "staging": 3
  }
}
```

Only one variation per environment can be active at a time for now. In the future, we may add suport for percentage rollouts and targeting.

The `latch-server` package creates a GraphQL API over the Google Storage bucket. The UI uses the GraphQL API to create and modify the flags.

Authentication is provided by an OAuth client that uses your underlying permissions in the Google project. If you have access to the bucket that holds the flags, then you can manage the flags from the UI.

On initialization, the client will create a pub/sub subscription to the bucket's notification topic and download all of the flags it is watching from google storage. It keeps track of the last object generation id for each flag to prevent a race condition from inserting a stale value into the cache.

When a flag's value is updated, the pub/sub subscription receives a payload with the object's metadata. We store values directly in the object metadata if they're small enough (under 8kb) so that we don't have to reach out to storage on every change. If the values aren't in the metadata, then we fetch the new object from storage and add the new value to the cache.

There is only a client for nodejs at the moment, but it is straightforward to implement a client for any language that Google has written a client for (C++, C#, Go, Java, PHP, Python, and Ruby).

## Limitations

There can only be one active value per environment. This isn't a fundamental limitation and we may build out support for percentage rollouts and targeting in the future.

Pub/sub is limited to 10k subscriptions. If your application has more than 10k nodes, then some sort of connection pooler will need to be built between pub/sub and your nodes.

It takes about 1-2 seconds to create the pub/sub subscription during initialization. It's not suitable for serverless environments without some sort of intermediate connection pooling server.
