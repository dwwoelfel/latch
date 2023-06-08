import {createServer} from './server/server.js';
import process from 'process';
import {initializeConfig} from './config.js';

async function start() {  
  const config = await initializeConfig();

  const port = parseInt(process.env.PORT || '6060', 10);
  const {server, shutdown: shutdownServer} = await createServer({
    config,
  });

  server.listen({
    port,
    host: config.env === 'development' ? 'localhost' : '0.0.0.0',
  });

  let shutdownPromise: Promise<any> | null;

  const shutdownImpl = async () => {
    console.log('got shutdown');
    await Promise.all([server.close(), shutdownServer()]);
    process.exit(1);
  };

  const shutdown = async () => {
    if (shutdownPromise) {
      return await shutdownPromise;
    }
    shutdownPromise = shutdownImpl();
    await shutdownPromise;
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);
  process.on('beforeExit', shutdown);  
}

start();
