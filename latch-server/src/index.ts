import {Storage} from '@google-cloud/storage';
import {createServer} from './server/server.js';
import process from 'process';
import {PubSub} from '@google-cloud/pubsub';
import {LatchClient, LatchFlagConfig} from 'latch-node-sdk';

export type Env = 'development' | 'production';

async function start() {
  const bucketName = process.env.BUCKET_NAME;
  const projectId = process.env.PROJECT_ID;
  const topicName = process.env.TOPIC_NAME;
  const env = process.env.NODE_ENV;
  if (!bucketName) {
    throw new Error('Missing environment variable BUCKET_NAME');
  }
  if (!projectId) {
    throw new Error('Missing environment variable PROJECT_ID');
  }
  if (!topicName) {
    throw new Error('Missing environment variable TOPIC_NAME');
  }
  if (!env) {
    throw new Error('Missing environment variable NODE_ENV');
  }
  if (env !== 'development' && env !== 'production') {
    throw new Error('NODE_ENV must be either development or production');
  }
  const envTyped: Env = env;

  const bucket = new Storage().bucket(bucketName);
  const topic = new PubSub({projectId}).topic(topicName);
  const port = parseInt(process.env.PORT || '6060', 10);
  const server = await createServer({
    bucket,
    topic,
    env: envTyped,
    isDev: env === 'development',
  });

  const latchClient = new LatchClient<{
    caitlin_mood: LatchFlagConfig<'string'>;
  }>({
    flags: {
      caitlin_mood: {defaultValue: 'happy', flagType: 'string'},
    },
    bucketName,
    projectId,
    topicName,
    environment: envTyped,
  });
  latchClient.on('flagUpdated', ({key, value, previousValue}) => {
    console.log('%s updated from %s to %s', key, previousValue, value);
  });
  latchClient.on('error', (err) => {
    console.error('Latch error', err);
  });
  console.time('latchClient.init');
  await latchClient.init();
  console.timeEnd('latchClient.init');

  await server.listen({
    port,
    host: env === 'development' ? 'localhost' : '0.0.0.0',
  });

  let shutdownPromise: Promise<any> | null;

  const shutdownImpl = async () => {
    console.log('got shutdown');
    server.close();
    await latchClient.shutdown();
    process.exit(1);
  };

  const shutdown = async () => {
    if (shutdownPromise) {
      return await shutdownPromise;
    }
    shutdownPromise = shutdownImpl();
    await shutdownPromise;
  };

  // const init = client.init();

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);
  process.on('beforeExit', shutdown);
}

start();
