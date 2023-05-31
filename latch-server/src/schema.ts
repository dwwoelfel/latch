import {Bucket, File} from '@google-cloud/storage';
import {makeExecutableSchema} from '@graphql-tools/schema';
import DataLoader from 'dataloader';
import fs from 'fs';
import {GraphQLError} from 'graphql';
import proto from 'protobufjs';
import {Resolvers} from './resolvers-types';

const sdl = fs.readFileSync('schema.graphql', 'utf-8');

function validateKeyName(key: string): string {
  if (key.length > 1024) {
    throw new GraphQLError(
      'The feature flag key must be fewer than 1024 characters',
    );
  }
  if (!key.match(/^[A-Za-z0-9_-]+$/)) {
    throw new GraphQLError(
      'The feature flag key can only contain letters, numbers, underscores, and hyphens.',
    );
  }
  return key;
}

type FlagKey = {
  key: string;
  generation?: string;
};

type FlagValue = {
  key: string;
  variations: {value: any; description?: string}[];
  currentVariation: number;
  description?: string | null | undefined;
  type: string;
};

type FlagLoader = DataLoader<FlagKey, FlagValue, string>;

type FlagMetaLoader = DataLoader<FlagKey, {key: string; generation: string}>;

export type Context = {
  bucket: Bucket;
  flagLoader: FlagLoader;
  metaLoader: FlagMetaLoader;
};

export type FeatureFlagSource = {
  key: string;
};

export type FeatureFlagVersionsConnectionSource = {
  versions: File[];
  hasNextPage: boolean;
};

export type FeatureFlagVersionSource = {
  key: string;
  generation: string;
  timeDeleted: string;
};

export function createContext({bucket}: {bucket: Bucket}) {
  return {
    bucket,
    flagLoader: new DataLoader<FlagKey, FlagValue, string>(
      async ([{key, generation}]) => {
        console.time('download ' + key + ' ' + generation);
        const options = generation ? {generation} : {};
        const downloadResult = await bucket
          .file(`flags/${key}`, options)
          .download();
        console.timeEnd('download ' + key + ' ' + generation);
        return [JSON.parse(downloadResult.toString())];
      },
      {
        batch: false,
        name: 'flagLoader',
        cache: true,
        cacheKeyFn: ({key, generation}) => `${key}:${generation}`,
      },
    ),
    metaLoader: new DataLoader<
      FlagKey,
      {key: string; generation: string},
      string
    >(
      async ([{key, generation}]) => {
        console.time('get ' + key);
        const options = generation ? {generation} : {};
        const [file] = await bucket.file(`flags/${key}`, options).get();
        console.timeEnd('get ' + key);
        return [{key: key, generation: file.metadata.generation}];
      },
      {
        batch: false,
        name: 'flagMetaLoader',
        cache: true,
        cacheKeyFn: ({key, generation}) => `${key}:${generation}`,
      },
    ),
  };
}

// Returns the lexicographically next string.
// Used for pagination on the feature flags because the `startOffset` parameter
// is inclusive
function getNextString(s: string): string {
  if (s === '') {
    return 'a';
  }
  let lastChar = s.slice(-1);
  let restOfString = s.slice(0, -1);
  let nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
  return restOfString + nextChar;
}

const pageTokenProto = new proto.Type('PageToken')
  .add(new proto.Field('name', 1, 'string'))
  .add(new proto.Field('generation', 2, 'int64'));

// @ts-ignore: Not using this now, but could potentially be used for better pagination later
function createPageToken({
  name,
  generation,
}: {
  name: string;
  generation: string;
}): string {
  const b = pageTokenProto
    .encode({
      name,
      // @ts-expect-error: it thinks Long.fromString doesn't exist, but it does
      generation: proto.util.Long.fromString(generation),
    })
    .finish();
  return proto.util.base64.encode(b, 0, b.length);
}

const featureFlagTypeToEnum = {
  boolean: 'BOOL',
  integer: 'INT',
  float: 'FLOAT',
  string: 'STRING',
  json: 'JSON',
};

const enumToFeatureFlagType = {
  BOOL: 'boolean',
  INT: 'integer',
  FLOAT: 'float',
  STRING: 'string',
  JSON: 'json',
};

function keyOfObjName(name: string): string {
  return name.replace('flags/', '');
}

type NodeId = {
  typeName: 'FeatureFlag';
  naturalId: string;
};

function encodeNodeId({typeName, naturalId}: NodeId): string {
  return Buffer.from(`${typeName}:${naturalId}`, 'utf-8').toString('hex');
}

function decodeNodeId(id: string): NodeId {
  const [typeName, naturalId] = Buffer.from(id, 'hex')
    .toString('utf-8')
    .split(':');
  // TODO: Will have to patch this if we add more node types
  if (typeName !== 'FeatureFlag') {
    throw new GraphQLError('Invalid node id.');
  }

  return {typeName, naturalId};
}

function toHex(s: string): string {
  return Buffer.from(s, 'utf-8').toString('hex');
}

function fromHex(s: string): string {
  return Buffer.from(s, 'hex').toString('utf-8');
}

export const resolvers: Resolvers = {
  Node: {
    __resolveType() {
      // TODO: will need to fix if we add more node types
      return 'FeatureFlag';
    },
  },
  Query: {
    async node(_parent, args, context) {
      const {typeName, naturalId} = decodeNodeId(String(args.id));
      switch (typeName) {
        case 'FeatureFlag':
          context.metaLoader.load({key: naturalId}).catch((_e) => null);
          try {
            return await context.flagLoader.load({key: naturalId});
          } catch (e) {
            if ((e as any).code === 404) {
              return null;
            } else {
              throw e;
            }
          }
      }
    },
    async featureFlag(_parent, args, context) {
      try {
        // preload just in case
        context.metaLoader.load({key: args.key}).catch((_e) => null);
        return await context.flagLoader.load({key: args.key});
      } catch (e) {
        if ((e as any).code === 404) {
          return null;
        } else {
          throw e;
        }
      }
    },
    async featureFlags(_parent, args, context) {
      const [files, nextQuery, metadata] = await context.bucket.getFiles({
        prefix: 'flags',
        autoPaginate: false,
        maxResults: args.first,
        startOffset: args.after
          ? getNextString(fromHex(args.after))
          : undefined,
      });

      for (const file of files) {
        const key = keyOfObjName(file.name);
        context.metaLoader.prime(
          {key},
          {
            generation: file.metadata.generation,
            key: key,
          },
        );
      }

      return [files, nextQuery, metadata];
    },
  },
  Mutation: {
    async createFeatureFlag(_parent, args, context) {
      const key = validateKeyName(args.input.key);
      if (args.input.variations.length === 0) {
        throw new GraphQLError('Must include at least one variation.');
      }
      // TODO: Validate that variations are all of the correct type
      if (!args.input.variations[args.input.currentVariation]) {
        throw new GraphQLError(
          'The current variation must be one the listed variations.',
        );
      }
      const file = context.bucket.file(`flags/${key}`);
      const flagValue = JSON.stringify({
        key: key,
        type: enumToFeatureFlagType[args.input.type],
        variations: args.input.variations,
        currentVariation: args.input.currentVariation,
        description: args.input.description,
      });
      try {
        await file.save(flagValue, {
          preconditionOpts: {
            ifGenerationMatch: 0,
          },
        });
      } catch (e) {
        if ((e as any).code === 412) {
          throw new GraphQLError(
            'Could not create the feature flag. There is another flag with the same key.',
          );
        } else {
          console.error(e);
          throw e;
        }
      }
      return {
        featureFlag: {key},
      };
    },
    async updateFeatureFlag(_parent, args, context) {
      const flag = await context.flagLoader.load({key: args.input.key});
      const patch = args.input.patch;
      const newFlag = {
        ...flag,
        variations: patch.variations || flag.variations,
        currentVariation:
          patch.currentVariation != null
            ? patch.currentVariation
            : flag.currentVariation,
        description:
          patch.description !== undefined
            ? patch.description
            : flag.description,
      };
      if (newFlag.variations.length === 0) {
        throw new GraphQLError('Must include at least one variation.');
      }
      // TODO: Validate that variations are all of the correct type
      if (!newFlag.variations[newFlag.currentVariation]) {
        throw new GraphQLError(
          'The current variation must be one the listed variations.',
        );
      }
      const file = context.bucket.file(`flags/${args.input.key}`);
      const flagValue = JSON.stringify(newFlag);
      try {
        const generation = args.input.generation;
        // @ts-expect-error: we get the value as a string, so we'll pass it as
        //                   a string in case it doesn't fit in a js number
        const ifGenerationMatch = generation as number;
        await file.save(flagValue, {
          preconditionOpts: {
            ifGenerationMatch,
          },
        });
        context.flagLoader.clear({key: args.input.key});
        context.metaLoader.clear({key: args.input.key});
      } catch (e) {
        if ((e as any).code === 412) {
          throw new GraphQLError(
            'Could not update the feature flag. There is a newer version of the flag available.',
          );
        } else {
          console.error(e);
          throw e;
        }
      }
      return {
        featureFlag: {key: args.input.key},
      };
    },
  },
  FeatureFlag: {
    id(parent) {
      return encodeNodeId({typeName: 'FeatureFlag', naturalId: parent.key});
    },
    key(parent) {
      return parent.key;
    },
    async generation(parent, _args, context) {
      const res = await context.metaLoader.load(parent);
      return res.generation;
    },
    async description(parent, _args, context) {
      return (await context.flagLoader.load(parent)).description || null;
    },
    async variations(parent, _args, context) {
      return (await context.flagLoader.load(parent)).variations;
    },
    async currentVariation(parent, _args, context) {
      return (await context.flagLoader.load(parent)).currentVariation;
    },    
    async type(parent, _args, context) {
      const flag = await context.flagLoader.load(parent);
      // @ts-expect-error: This is probably fine
      return featureFlagTypeToEnum[flag.type];
    },
    async previousVersions(parent, args, context) {
      const name = `flags/${parent.key}`;
      const [files] = await context.bucket.getFiles({
        versions: true,
        autoPaginate: true,
        startOffset: name,
        endOffset: getNextString(name),
      });
      const allVersions = files.filter((f) => f.metadata.timeDeleted).reverse();

      if (!args.after) {
        return {
          versions: allVersions.slice(0, args.first),
          hasNextPage: allVersions.length > args.first,
        };
      }

      const afterVersions = [];
      let foundCursor = false;
      const generation = fromHex(args.after);

      for (const version of allVersions) {
        if (foundCursor) {
          afterVersions.push(version);
        } else {
          foundCursor = version.metadata.generation === generation;
        }
      }

      if (!foundCursor) {
        throw new GraphQLError('Invalid cursor.');
      }

      return {
        versions: afterVersions.slice(0, args.first),
        hasNextPage: afterVersions.length > args.first,
      };
    },
  },
  FeatureFlagsEdge: {
    node(parent) {
      return {
        key: keyOfObjName(parent.name),
      };
    },
    cursor(parent) {
      return toHex(parent.name);
    },
  },
  FeatureFlagsConnection: {
    pageInfo(parent) {
      const [files, nextQuery] = parent;
      const start = files[0]?.name;
      const end = files[files.length - 1]?.name;
      return {
        hasNextPage:
          (nextQuery as {pageToken?: string} | null)?.pageToken != null,
        hasPreviousPage: false, // TODO: backwards pagination
        startCursor: start ? toHex(start) : null,
        endCursor: end ? toHex(end) : null,
      };
    },
    nodes(parent) {
      const [files] = parent;
      return files.map((file) => {
        return {
          key: keyOfObjName(file.name),
        };
      });
    },
    edges(parent) {
      const [files] = parent;
      return files;
    },
  },
  FeatureFlagVersionsEdge: {
    node(parent) {
      return {
        key: keyOfObjName(parent.name),
        generation: parent.metadata.generation,
        timeDeleted: parent.metadata.timeDeleted,
      };
    },
    cursor(parent) {
      return toHex(parent.metadata.generation);
    },
  },
  FeatureFlagVersionsConnection: {
    pageInfo(parent) {
      const {versions: files, hasNextPage} = parent;
      const start = files[0]?.metadata.generation;
      const end = files[files.length - 1]?.metadata.generation;
      return {
        hasNextPage,
        hasPreviousPage: false, // backwards pagination
        startCursor: start ? toHex(start) : null,
        endCursor: end ? toHex(end) : null,
      };
    },
    nodes(parent) {
      const {versions: files} = parent;
      return files.map((file) => {
        return {
          key: keyOfObjName(file.name),
          generation: file.metadata.generation,
          timeDeleted: file.metadata.timeDeleted,
        };
      });
    },
    edges(parent) {
      const {versions: files} = parent;
      return files;
    },
  },
  PageInfo: {
    startCursor(parent) {
      return parent.startCursor || null;
    },
    endCursor(parent) {
      return parent.endCursor || null;
    },
    hasNextPage(parent) {
      return parent.hasNextPage;
    },
    hasPreviousPage(parent) {
      return parent.hasPreviousPage;
    },
  },
  UpdateFeatureFlagPayload: {
    featureFlag(parent) {
      return parent.featureFlag;
    },
  },
  CreateFeatureFlagPayload: {
    featureFlag(parent) {
      return parent.featureFlag;
    },
  },
  FeatureFlagVariation: {
    value(parent) {
      return parent.value;
    },
    description(parent) {
      return parent.description || null;
    },
  },
  FeatureFlagVersion: {
    generation(parent) {
      return parent.generation;
    },
    timeDeleted(parent) {
      return parent.timeDeleted;
    },
    async description(parent, _args, context) {
      return (await context.flagLoader.load(parent)).description || null;
    },
    async variations(parent, _args, context) {
      return (await context.flagLoader.load(parent)).variations;
    },
    async currentVariation(parent, _args, context) {
      return (await context.flagLoader.load(parent)).currentVariation;
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs: sdl,
  resolvers,

  // Require resolvers so that we don't forget to call the dataloader
  resolverValidationOptions: {requireResolversForAllFields: 'error'},
});
