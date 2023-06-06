import process from 'process';
import sodium from 'sodium-native';

class Secret<T> {
  private _secret: T;
  private _origin: string;
  private _redacted: string;
  constructor(opts: {secret: T; origin: string}) {
    this._secret = opts.secret;
    this._origin = opts.origin;
    this._redacted = `<secret origin:${this._origin}>`;
  }

  get secret() {
    return this._secret;
  }

  public toString() {
    return this._redacted;
  }
  public toJSON(): string {
    return this._redacted;
  }
  public valueOf(): string {
    return this._redacted;
  }

  // used by `console.log` on objects
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this._redacted;
  }
  public toLocaleString(): string {
    return this._redacted;
  }
}

function ensureEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(`Expected process.env.${key} to be set`);
  }
  return v;
}

export type Env = 'development' | 'production';

export type Config = {
  env: Env;
  bucketName: string;
  projectId: string;
  topicName: string;
  isDev: boolean;
  isProd: boolean;
  clientId: string;
  clientSecret: Secret<string>;
  encryptionKey: Secret<sodium.SecureBuffer>;
};

export async function initializeConfig(): Promise<Config> {
  const env = ensureEnv('NODE_ENV');
  if (env !== 'development' && env !== 'production') {
    throw new Error('NODE_ENV must be either development or production');
  }

  const isDev = env === 'development';
  if (isDev) {
    const dotenv = await import('dotenv');
    dotenv.config();
  }

  const encryptionKey = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES);

  encryptionKey.write(ensureEnv('ENCRYPTION_KEY'), 'hex');

  return {
    env,
    isDev,
    isProd: env === 'production',
    bucketName: ensureEnv('BUCKET_NAME'),
    projectId: ensureEnv('PROJECT_ID'),
    topicName: ensureEnv('TOPIC_NAME'),
    clientId: ensureEnv('CLIENT_ID'),
    clientSecret: new Secret({
      secret: ensureEnv('CLIENT_SECRET'),
      origin: 'client_secret',
    }),
    encryptionKey: new Secret({
      secret: encryptionKey,
      origin: 'encryption_key',
    }),
  };
}
