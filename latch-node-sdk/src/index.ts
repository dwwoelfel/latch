import {Message, PubSub, Subscription} from '@google-cloud/pubsub';
import {Bucket, Storage} from '@google-cloud/storage';
import {randomBytes} from 'crypto';
import {EventEmitter} from 'events';
import {hostname} from 'os';

export type LatchFlagType = 'string' | 'integer' | 'float' | 'boolean' | 'json';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonArray
  | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

type LatchFlagValueType = {
  string: string;
  integer: number;
  float: number;
  boolean: boolean;
  json: JsonValue;
};

export type LatchFlagConfig<K extends keyof LatchFlagValueType> = {
  flagType: K;
  defaultValue: LatchFlagValueType[K];
};

export type LatchStringFlag = LatchFlagConfig<'string'>;
export type LatchIntegerFlag = LatchFlagConfig<'integer'>;
export type LatchFloatFlag = LatchFlagConfig<'float'>;
export type LatchBooleanFlag = LatchFlagConfig<'boolean'>;
export type LatchJsonFlag = LatchFlagConfig<'json'>;

export type LatchClientConfig<
  Flags extends {[K: string]: LatchFlagConfig<keyof LatchFlagValueType>},
> = {
  flags: Flags;
  bucketName: string;
  topicName: string;
  projectId: string;
  environment: string;
  flagPrefix?: string;
};

interface Events<
  FlagT extends {[K: string]: LatchFlagConfig<keyof LatchFlagValueType>},
> {
  flagUpdated: {
    key: keyof FlagT;
    value: FlagT[keyof FlagT]['defaultValue'];
    previousValue: FlagT[keyof FlagT]['defaultValue'];
  };
  error: Error;
}

function sanitizePubSubLabel(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
}

function validateConfig(config: any) {
  if (!config) {
    throw new Error('The latch client must be constructed with a config.');
  }
  if (!config.environment) {
    throw new Error(
      'The latch client must be constructed with an environment key in the config.',
    );
  }
  if (!config.bucketName) {
    throw new Error(
      'The latch client must be constructed with a bucketName key in the config.',
    );
  }
  if (!config.topicName) {
    throw new Error(
      'The latch client must be constructed with a topicName key in the config.',
    );
  }

  if (!config.projectId) {
    throw new Error(
      'The latch client must be constructed with a projectId key in the config.',
    );
  }
}

export class LatchClient<
  FlagT extends {[K: string]: LatchFlagConfig<keyof LatchFlagValueType>},
> extends EventEmitter {
  private config: LatchClientConfig<FlagT>;
  private environment: string;
  private metadataValueKey: string;
  private bucket: Bucket;
  private pubsub: PubSub;
  private cleanupCallbacks: (() => Promise<any>)[];
  private flagValues: Map<
    keyof FlagT,
    {
      generation: bigint;
      value: any;
    }
  >;
  private flagPrefix: string;
  private shutdownCalled: boolean = false;

  constructor(config: LatchClientConfig<FlagT>) {
    super();
    validateConfig(config);
    this.config = config;

    this.flagPrefix = config.flagPrefix || 'flags/';
    this.environment = config.environment;
    this.metadataValueKey = `env:${this.environment}`;
    if (this.flagPrefix.slice(-1) !== '/') {
      throw new Error(
        `Invalid flagPrefix '${config.flagPrefix}'. Must end with '/'.`,
      );
    }

    this.bucket = new Storage().bucket(config.bucketName);

    this.pubsub = new PubSub({
      projectId: config.projectId,
    });

    this.cleanupCallbacks = [];
    this.flagValues = new Map();
  }

  private updateFlagValue<K extends keyof FlagT>({
    key,
    type,
    value,
    generation,
  }: {
    key: K;
    type: string;
    value: FlagT[K]['defaultValue'];
    generation: bigint;
  }) {
    const flagConfig = this.config.flags[key];
    if (!flagConfig) {
      return;
    }
    if (type !== flagConfig.flagType) {
      this.emit(
        'error',
        new Error(
          `Got invalid flag type ${type} for key ${key as string}, expected ${
            flagConfig.flagType
          }.`,
        ),
      );
      return;
    }

    const currentGeneration = this.flagValues.get(key)?.generation || BigInt(0);
    if (generation > currentGeneration) {
      const previousValue = this.flagValue(key);
      this.flagValues.set(key, {
        generation: generation,
        value: value,
      });
      if (JSON.stringify(previousValue) !== JSON.stringify(value)) {
        this.emit('flagUpdated', {key, value, previousValue});
      }
    }
  }

  private async syncFromStorage(key: string): Promise<void> {
    const name = `${this.flagPrefix}${key}`;
    const {file, generation} = await new Promise<{
      file: Buffer;
      generation: string;
    }>((resolve, reject) => {
      const data: Buffer[] = [];
      let generation: string | null = null;
      this.bucket
        .file(name)
        .createReadStream()
        .on('response', (resp) => {
          generation = resp.headers['x-goog-generation'];
        })
        .on('data', (chunk) => data.push(chunk))
        .on('end', () => {
          if (!generation) {
            reject(new Error('Missing x-goog-generation header.'));
          } else {
            resolve({file: Buffer.concat(data), generation});
          }
        })
        .on('error', (e) => reject(e));
    });
    const props = JSON.parse(file.toString());
    const value =
      props?.variations?.[
        props.environmentVariations[this.environment] ?? props.defaultVariation
      ]?.value;

    this.updateFlagValue({
      key,
      type: props.type,
      value,
      generation: BigInt(generation),
    });
  }

  private async handleSubscriptionMessage(message: Message) {
    const {eventType, objectId} = message.attributes;
    if (
      eventType === 'OBJECT_FINALIZE' &&
      typeof objectId === 'string' &&
      objectId.startsWith(this.flagPrefix)
    ) {
      const key = objectId.slice(this.flagPrefix.length);
      const flagConfig = this.config.flags[key];
      if (flagConfig) {
        const data = JSON.parse(message.data.toString());
        if (data.metadata?.type && data.metadata?.[this.metadataValueKey]) {
          this.updateFlagValue({
            key,
            type: data.metadata.type,
            value: JSON.parse(data.metadata[this.metadataValueKey]),
            generation: BigInt(data.generation),
          });
        } else {
          try {
            await this.syncFromStorage(key);
          } catch (e) {
            const err = new Error(`Error fetching key ${key} from storage.`);
            // @ts-expect-error: We could create our own error class
            err.originalError = e;
            this.emit('error', err);
          }
        }
      }
    }
    message.ack();
  }

  private async setupSubscription(): Promise<Subscription> {
    const host = hostname();
    const randString = randomBytes(4).toString('hex');
    const [subscription] = await this.pubsub
      .topic(this.config.topicName)
      .createSubscription(`${host}-${randString}`, {
        retainAckedMessages: false,
        expirationPolicy: {
          ttl: {seconds: 60 * 60 * 24 /* 1 day (the minimum) */},
        },
        labels: {
          hostname: sanitizePubSubLabel(host),
          client: 'triode-node',
          // PACKAGE_VERSION replaced by post-build step
          version: sanitizePubSubLabel('v_PACKAGE_VERSION'),
        },
        filter: `hasPrefix(attributes.objectId, "${this.flagPrefix}")`,
      });
    subscription.on('message', async (message: Message) => {
      try {
        await this.handleSubscriptionMessage(message);
      } catch (e) {
        const err = new Error(
          `Error handling subscription message id=${message.id}`,
        );
        // @ts-expect-error: We could create our own error class
        err.originalError = e;
        this.emit('error', err);
      }
    });
    subscription.on('error', (e) => {
      const err = new Error(
        'Subscription error. Feature flag values may not be up to date.',
      );
      // @ts-expect-error: TODO: create custom error class
      err.originalError = e;
      this.emit('error', e);
    });
    subscription.on('close', () => {
      if (!this.shutdownCalled) {
        this.emit(
          'error',
          new Error(
            'Subscription closed before shutdown was called. Flags will no longer sync.',
          ),
        );
      }
    });
    return subscription;
  }

  emit<K extends keyof Events<FlagT>>(
    event: K,
    value: Events<FlagT>[K],
  ): boolean {
    return super.emit(event, value);
  }

  on<K extends keyof Events<FlagT>>(
    event: K,
    listener: (value: Events<FlagT>[K]) => void,
  ): this {
    return super.on(event, listener);
  }

  off<K extends keyof Events<FlagT>>(
    event: K,
    listener: (value: Events<FlagT>[K]) => void,
  ): this {
    return super.off(event, listener);
  }

  public async init(): Promise<void | Error[]> {
    try {
      const subscription = await this.setupSubscription();
      this.cleanupCallbacks.push(() => subscription.delete());
    } catch (e) {
      return [e as Error];
    }
    const errors: Error[] = [];
    await Promise.all(
      Object.keys(this.config.flags).map(async (key) => {
        try {
          await this.syncFromStorage(key);
        } catch (e) {
          const err = new Error(`Error fetching key ${key} from storage.`);
          // @ts-expect-error: We could create our own error class
          err.originalError = e;
          errors.push(err);
        }
      }),
    );
    if (errors.length) {
      return errors;
    }
  }

  public async shutdown(): Promise<void | Error[]> {
    this.shutdownCalled = true;
    const errors: Error[] = [];
    await Promise.all(
      this.cleanupCallbacks.map(async (cb) => {
        try {
          await cb();
        } catch (e) {
          errors.push(e as Error);
        }
      }),
    );
    if (errors.length) {
      return errors;
    }
  }

  public flagValue<K extends keyof FlagT>(
    key: K,
    defaultValue?: FlagT[K]['defaultValue'],
  ): FlagT[K]['defaultValue'] {
    if (this.shutdownCalled) {
      this.emit(
        'error',
        new Error('Accessed flag value after shutdown was called.'),
      );
    }
    const current = this.flagValues.get(key);
    if (current !== undefined) {
      return current.value as FlagT[K]['defaultValue'];
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    const flagConfig = this.config.flags[key];
    if (flagConfig == null) {
      throw new Error(
        `Unknown feature flag ${
          key as string
        }. It was not provided in the constructor.`,
      );
    }

    return flagConfig.defaultValue;
  }
}
