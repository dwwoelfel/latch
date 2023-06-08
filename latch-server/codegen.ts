import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    'src/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: './schema#Context',
        mappers: {
          ServerConfig: './schema#ServerConfigSource',
          Viewer: './schema#ViewerSource',
          FeatureFlag: './schema#FeatureFlagSource',
          FeatureFlagVersion: './schema#FeatureFlagVersionSource',
          TopicSubscription: '@google-cloud/pubsub#Subscription',
          FeatureFlagsConnection: '@google-cloud/storage#GetFilesResponse',
          FeatureFlagsEdge: '@google-cloud/storage#File',
          FeatureFlagVersionsConnection:
            './schema#FeatureFlagVersionsConnectionSource',
          FeatureFlagVersionsEdge: '@google-cloud/storage#File',
        },
      },
    },
  },
};
export default config;
