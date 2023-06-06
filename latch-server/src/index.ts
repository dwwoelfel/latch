import {createServer} from './server/server.js';
import process from 'process';
import {LatchClient, LatchFlagConfig} from 'latch-node-sdk';
import {initializeConfig} from './config.js';

async function start() {
  const config = await initializeConfig();

  const port = parseInt(process.env.PORT || '6060', 10);
  const {server, shutdown: shutdownServer} = await createServer({
    config,
  });

  const latchClient = new LatchClient<{
    caitlin_mood: LatchFlagConfig<'string'>;
  }>({
    flags: {
      caitlin_mood: {defaultValue: 'happy', flagType: 'string'},
    },
    bucketName: config.bucketName,
    projectId: config.projectId,
    topicName: config.topicName,
    environment: config.env,
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

  server.listen({
    port,
    host: config.env === 'development' ? 'localhost' : '0.0.0.0',
  });

  let shutdownPromise: Promise<any> | null;

  const shutdownImpl = async () => {
    console.log('got shutdown');
    await Promise.all([
      server.close(),
      shutdownServer(),
      latchClient.shutdown(),
    ]);
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
