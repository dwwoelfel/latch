import {Topic} from '@google-cloud/pubsub';
import {Bucket, File} from '@google-cloud/storage';
import {makeExecutableSchema} from '@graphql-tools/schema';
import DataLoader from 'dataloader';
import fs from 'fs';
import {
  GraphQLError,
  GraphQLScalarType,
  Kind,
  ObjectValueNode,
  ValueNode,
} from 'graphql';
import proto from 'protobufjs';
import {FeatureFlagType, Resolvers} from './resolvers-types';

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

const featureFlagTypeToEnum = {
  boolean: FeatureFlagType.Bool,
  integer: FeatureFlagType.Int,
  float: FeatureFlagType.Float,
  string: FeatureFlagType.String,
  json: FeatureFlagType.Json,
};

const expectedType = {
  boolean: 'boolean',
  integer: 'number',
  float: 'number',
  string: 'string',
};

const enumToFeatureFlagType: Record<
  FeatureFlagType,
  keyof typeof featureFlagTypeToEnum
> = {
  BOOL: 'boolean',
  INT: 'integer',
  FLOAT: 'float',
  STRING: 'string',
  JSON: 'json',
};

function validateType(type: keyof typeof featureFlagTypeToEnum, value: any) {
  if (type === 'json') {
    return value;
  }
  if (typeof value !== expectedType[type]) {
    throw new GraphQLError(
      `Expected \`${value}\` to be of type ${type}, got ${typeof type}.`,
    );
  }

  if (type === 'integer' && !Number.isInteger(value)) {
    throw new GraphQLError(`Expected \`${value}\` to be an integer.`);
  }

  return value;
}

function validateFlag(flag: FlagValue): FlagValue {
  validateKeyName(flag.key);
  if (flag.variations.length === 0) {
    throw new GraphQLError('Must include at least one variation.');
  }
  // TODO: Validate that variations are all of the correct type
  if (flag.variations[flag.defaultVariation] === undefined) {
    throw new GraphQLError(
      'The default variation must be one the listed variations.',
    );
  }

  for (const [key, value] of Object.entries(flag.environmentVariations)) {
    if (!flag.variations[value] === undefined) {
      throw new GraphQLError(
        `The default variation for ${key} must be one the listed variations.`,
      );
    }
  }

  for (const variation of flag.variations) {
    validateType(flag.type, variation.value);
  }
  return flag;
}

function validateEnvironmentName(key: string): string {
  if (key.length > 1024) {
    throw new GraphQLError(
      'The environment name must be fewer than 1024 characters',
    );
  }
  if (!key.match(/^[A-Za-z0-9_-]+$/)) {
    throw new GraphQLError(
      'The environment name can only contain letters, numbers, underscores, and hyphens.',
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
  variations: {value: any; description?: string | null | undefined}[];
  defaultVariation: number;
  environmentVariations: {[key: string]: number};
  description?: string | null | undefined;
  type: keyof typeof featureFlagTypeToEnum;
};

type FlagLoader = DataLoader<FlagKey, FlagValue, string>;

type FlagMetaLoader = DataLoader<FlagKey, {key: string; generation: string}>;

export type Context = {
  bucket: Bucket;
  topic: Topic;
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

export type ViewerSource = {
  __typename: 'Viewer';
};

export function createContext({
  bucket,
  topic,
}: {
  bucket: Bucket;
  topic: Topic;
}): Context {
  topic.getSubscriptions;
  return {
    bucket,
    topic,
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

function keyOfObjName(name: string): string {
  return name.replace('flags/', '');
}

type NodeId = {
  typeName: 'FeatureFlag' | 'Viewer';
  naturalId: string;
};

function encodeNodeId({typeName, naturalId}: NodeId): string {
  return Buffer.from(`${typeName}:${naturalId}`, 'utf-8').toString('hex');
}

function decodeNodeId(id: string): NodeId {
  const [typeName, naturalId] = Buffer.from(id, 'hex')
    .toString('utf-8')
    .split(':');
  // TODO: Better way to check this
  if (typeName !== 'FeatureFlag' && typeName !== 'Viewer') {
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

type VariationByEnvironment = {[key: string]: number};

function ensureStringToInt(value: any): VariationByEnvironment {
  if (typeof value !== 'object' || value === null) {
    throw new GraphQLError(
      `VariationByEnvironment cannot represent non-object value ${value}`,
    );
  }
  for (const [key, v] of Object.entries(value)) {
    if (typeof key !== 'string') {
      throw new GraphQLError(
        `VariationByEnvironment cannot represent object with non-string key ${key}`,
      );
    }
    if (typeof v !== 'number') {
      throw new GraphQLError(
        `VariationByEnvironment cannot represent object with non-integer value ${v} for key ${key}`,
      );
    }
    if (!Number.isInteger(v)) {
      throw new GraphQLError(
        `VariationByEnvironment cannot represent object with non-integer value ${v} for key ${key}`,
      );
    }
  }
  return value;
}

const VariationByEnvironment = new GraphQLScalarType({
  name: 'VariationByEnvironment',
  description: 'An object with string keys and integer values.',
  serialize(outputValue) {
    return ensureStringToInt(outputValue);
  },
  parseValue(inputValue) {
    return ensureStringToInt(inputValue);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError('VariationByEnvironment value must be an object');
    }
    const value: VariationByEnvironment = {};

    for (const field of ast.fields) {
      if (field.kind === Kind.OBJECT_FIELD) {
        if (field.value.kind !== Kind.INT) {
          throw new GraphQLError(
            `VariationByEnvironment value must be an integer. Got ${field.value.kind} for field ${field.name.value}.`,
          );
        }
        value[field.name.value] = Number(field.value.value);
      } else {
        console.error('ERROR', field);
        throw new GraphQLError(
          'VariationByEnvironment fields must be object fields.',
        );
      }
    }

    return value;
  },
  extensions: {
    codegenScalarType: 'Record<string, number>',
    jsonSchema: {
      title: 'VariationByEnvironment',
      type: 'object',
      additionalProperties: {
        type: 'integer',
      },
    },
  },
});

function parseObject(ast: ObjectValueNode, variables: any): any {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    value[field.name.value] = parseLiteral(field.value, variables);
  });

  return value;
}

function parseLiteral(ast: ValueNode, variables: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast, variables);
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
  }
}

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize(v) {
    return v;
  },
  parseValue(v) {
    return v;
  },
  parseLiteral,
});

type FlagMetadata = {
  type: keyof typeof featureFlagTypeToEnum;
  defaultValue: string;
} & {[key: string]: string};

function fileMetadata(flag: FlagValue): FlagMetadata | undefined {
  const metadata = {
    type: flag.type,
    defaultValue: JSON.stringify(flag.variations[flag.defaultVariation].value),
  };

  for (const [key, value] of Object.entries(flag.environmentVariations)) {
    (metadata as {[key: string]: string})[`env:${key}`] = JSON.stringify(
      flag.variations[value].value,
    );
  }

  let sts = '';
  for (const [k, v] of Object.entries(metadata)) {
    sts += k.length;
    sts += v.length;
  }

  if (new Blob([sts]).size >= 8192) {
    return undefined;
  }

  return metadata;
}

export const resolvers: Resolvers = {
  Node: {
    __resolveType(parent) {
      // @ts-expect-error: We add this in the Query.node resolver
      return parent.__typename;
    },
  },
  VariationByEnvironment,
  JSON: JSONScalar,
  Query: {
    testVariationByEnvironment(_parent, args) {
      return args.input;
    },
    viewer() {
      return {__typename: 'Viewer'};
    },
    async node(_parent, args, context) {
      const {typeName, naturalId} = decodeNodeId(String(args.id));
      switch (typeName) {
        case 'FeatureFlag': {
          context.metaLoader.load({key: naturalId}).catch((_e) => null);
          try {
            const data: FeatureFlagSource = await context.flagLoader.load({
              key: naturalId,
            });
            return {...data, __typename: 'FeatureFlag'} as FeatureFlagSource;
          } catch (e) {
            if ((e as any).code === 404) {
              return null;
            } else {
              throw e;
            }
          }
        }
        case 'Viewer': {
          return {__typename: 'Viewer'};
        }
      }
    },
  },
  Viewer: {
    id() {
      return encodeNodeId({typeName: 'Viewer', naturalId: 'Viewer'});
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
    async topicSubscriptions(_parent, _args, context) {
      const [subs] = await context.topic.getSubscriptions({
        pageSize: 1000,
        autoPaginate: true,
      });
      return subs;
    },
    async environments(_parent, _args, context) {
      const [files] = await context.bucket.getFiles({
        prefix: 'environments',
        autoPaginate: true,
      });
      return files.map((file) => {
        return {
          name: file.name.replace('environments/', ''),
          color: file.metadata.metadata.color,
        };
      });
    },
  },
  Mutation: {
    async createEnvironment(_parent, args, context) {
      const name = validateEnvironmentName(args.input.name);
      const file = context.bucket.file(`environments/${name}`);
      await file.save('{}', {
        metadata: {
          metadata: {
            color: args.input.color,
          },
        },
      });
      const [envFile] = await file.get();
      return {
        environment: {
          name: envFile.name.replace('environments/', ''),
          color: envFile.metadata.metadata.color,
        },
        viewer: {__typename: 'Viewer'},
      };
    },
    async updateEnvironment(_parent, args, context) {
      const name = validateEnvironmentName(args.input.name);
      const file = context.bucket.file(`environments/${name}`);
      await file.save('{}', {
        metadata: {
          metadata: {
            color: args.input.patch.color,
          },
        },
      });
      const [envFile] = await file.get();
      return {
        environment: {
          name: envFile.name.replace('environments/', ''),
          color: envFile.metadata.metadata.color,
        },
        viewer: {__typename: 'Viewer'},
      };
    },
    async createFeatureFlag(_parent, args, context) {
      const newFlag: FlagValue = validateFlag({
        key: args.input.key,
        type: enumToFeatureFlagType[args.input.type],
        variations: args.input.variations,
        defaultVariation: args.input.defaultVariation,
        description: args.input.description,
        environmentVariations: args.input.environmentVariations,
      });

      const file = context.bucket.file(`flags/${newFlag.key}`);
      const flagValue = JSON.stringify(newFlag);
      try {
        await file.save(flagValue, {
          preconditionOpts: {
            ifGenerationMatch: 0,
          },
          metadata: {
            metadata: fileMetadata(newFlag),
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
        featureFlag: {key: newFlag.key},
      };
    },
    async updateFeatureFlag(_parent, args, context) {
      const oldFlag = await context.flagLoader.load({key: args.input.key});
      const patch = args.input.patch;
      const newFlag: FlagValue = validateFlag({
        ...oldFlag,
        variations: patch.variations || oldFlag.variations,
        defaultVariation:
          patch.defaultVariation != null
            ? patch.defaultVariation
            : oldFlag.defaultVariation,
        description:
          patch.description !== undefined
            ? patch.description
            : oldFlag.description,
        environmentVariations:
          patch.environmentVariations !== undefined
            ? patch.environmentVariations
            : oldFlag.environmentVariations,
      });

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
          metadata: {
            metadata: fileMetadata(newFlag),
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
  Environment: {
    name(parent) {
      return parent.name;
    },
    color(parent) {
      return parent.color;
    },
  },
  TopicSubscription: {
    name(parent) {
      return parent.name.split('/').slice(-1)[0];
    },
    async hostname(parent) {
      const [metadata] = await parent.getMetadata();
      return metadata?.labels?.hostname || null;
    },
    consoleUrl(parent) {
      const name = parent.name.split('/').slice(-1)[0];
      const projectId = parent.projectId;
      return `https://console.cloud.google.com/cloudpubsub/subscription/detail/${name}?project=${projectId}`;
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
    async defaultVariation(parent, _args, context) {
      return (await context.flagLoader.load(parent)).defaultVariation;
    },
    async environmentVariations(parent, _args, context) {
      return (await context.flagLoader.load(parent)).environmentVariations;
    },
    async type(parent, _args, context) {
      const flag = await context.flagLoader.load(parent);
      const res = featureFlagTypeToEnum[flag.type];
      return res;
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
    async defaultVariation(parent, _args, context) {
      return (await context.flagLoader.load(parent)).defaultVariation;
    },
    async environmentVariations(parent, _args, context) {
      return (await context.flagLoader.load(parent)).environmentVariations;
    },
  },
  CreateEnvironmentPayload: {
    environment(parent) {
      return parent.environment;
    },
    viewer() {
      return {__typename: 'Viewer'};
    },
  },
  UpdateEnvironmentPayload: {
    environment(parent) {
      return parent.environment;
    },
    viewer() {
      return {__typename: 'Viewer'};
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs: sdl,
  resolvers,

  // Require resolvers so that we don't forget to call the dataloader
  resolverValidationOptions: {requireResolversForAllFields: 'error'},
});
