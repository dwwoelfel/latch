import {Storage} from '@google-cloud/storage';
import {createServer} from './server/server.js';
import process from 'process';

async function start() {
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('Missing environment variable BUCKET_NAME');
  }
  const bucket = new Storage().bucket(bucketName);
  const port = parseInt(process.env.PORT || '6060', 10);
  const server = await createServer({bucket});
  await server.listen({port});
}

start();
