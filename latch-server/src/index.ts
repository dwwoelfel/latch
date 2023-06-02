import {Storage} from '@google-cloud/storage';
import {createServer} from './server/server.js';
import process from 'process';
import {PubSub} from '@google-cloud/pubsub';

async function start() {
  const bucketName = process.env.BUCKET_NAME;
  const projectId = process.env.PROJECT_ID;
  const topicName = process.env.TOPIC_NAME;
  if (!bucketName) {
    throw new Error('Missing environment variable BUCKET_NAME');
  }
  if (!projectId) {
    throw new Error('Missing environment variable PROJECT_ID');
  }
  if (!topicName) {
    throw new Error('Missing environment variable TOPIC_NAME');
  }
  const bucket = new Storage().bucket(bucketName);
  const topic = new PubSub({projectId}).topic(topicName);
  const port = parseInt(process.env.PORT || '6060', 10);
  const server = await createServer({bucket, topic});
  await server.listen({port});
}

start();
