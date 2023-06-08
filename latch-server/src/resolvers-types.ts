import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ServerConfigSource, ViewerSource, FeatureFlagSource, FeatureFlagVersionSource, FeatureFlagVersionsConnectionSource, Context } from './schema';
import { Subscription } from '@google-cloud/pubsub';
import { GetFilesResponse, File } from '@google-cloud/storage';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  VariationByEnvironment: { input: any; output: any; }
};

export type CreateEnvironmentInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateEnvironmentPayload = {
  __typename?: 'CreateEnvironmentPayload';
  environment: Environment;
  viewer: Viewer;
};

export type CreateFeatureFlagInput = {
  defaultVariation: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  environmentVariations: Scalars['VariationByEnvironment']['input'];
  key: Scalars['String']['input'];
  type: FeatureFlagType;
  variations: Array<FeatureFlagVariationInput>;
};

export type CreateFeatureFlagPayload = {
  __typename?: 'CreateFeatureFlagPayload';
  featureFlag: FeatureFlag;
};

export type Environment = {
  __typename?: 'Environment';
  color: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type FeatureFlag = Node & {
  __typename?: 'FeatureFlag';
  defaultVariation: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  environmentVariations: Scalars['VariationByEnvironment']['output'];
  generation: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  previousVersions: FeatureFlagVersionsConnection;
  type: FeatureFlagType;
  variations: Array<FeatureFlagVariation>;
};


export type FeatureFlagPreviousVersionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type FeatureFlagPatch = {
  defaultVariation?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  environmentVariations?: InputMaybe<Scalars['VariationByEnvironment']['input']>;
  variations?: InputMaybe<Array<FeatureFlagVariationInput>>;
};

export enum FeatureFlagType {
  Bool = 'BOOL',
  Float = 'FLOAT',
  Int = 'INT',
  Json = 'JSON',
  String = 'STRING'
}

export type FeatureFlagVariation = {
  __typename?: 'FeatureFlagVariation';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['JSON']['output'];
};

export type FeatureFlagVariationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['JSON']['input'];
};

export type FeatureFlagVersion = {
  __typename?: 'FeatureFlagVersion';
  defaultVariation: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  environmentVariations: Scalars['VariationByEnvironment']['output'];
  generation: Scalars['String']['output'];
  timeDeleted: Scalars['String']['output'];
  variations: Array<FeatureFlagVariation>;
};

export type FeatureFlagVersionsConnection = {
  __typename?: 'FeatureFlagVersionsConnection';
  edges: Array<FeatureFlagVersionsEdge>;
  nodes: Array<FeatureFlagVersion>;
  pageInfo: PageInfo;
};

export type FeatureFlagVersionsEdge = {
  __typename?: 'FeatureFlagVersionsEdge';
  cursor: Scalars['String']['output'];
  node: FeatureFlagVersion;
};

export type FeatureFlagsConnection = {
  __typename?: 'FeatureFlagsConnection';
  edges: Array<FeatureFlagsEdge>;
  nodes: Array<FeatureFlag>;
  pageInfo: PageInfo;
};

export type FeatureFlagsEdge = {
  __typename?: 'FeatureFlagsEdge';
  cursor: Scalars['String']['output'];
  node: FeatureFlag;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEnvironment: CreateEnvironmentPayload;
  createFeatureFlag: CreateFeatureFlagPayload;
  updateEnvironment: UpdateEnvironmentPayload;
  updateFeatureFlag: UpdateFeatureFlagPayload;
};


export type MutationCreateEnvironmentArgs = {
  input: CreateEnvironmentInput;
};


export type MutationCreateFeatureFlagArgs = {
  input: CreateFeatureFlagInput;
};


export type MutationUpdateEnvironmentArgs = {
  input: UpdateEnvironmentInput;
};


export type MutationUpdateFeatureFlagArgs = {
  input: UpdateFeatureFlagInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  testVariationByEnvironment?: Maybe<Scalars['VariationByEnvironment']['output']>;
  viewer: Viewer;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTestVariationByEnvironmentArgs = {
  input?: InputMaybe<Scalars['VariationByEnvironment']['input']>;
};

export type ServerConfig = {
  __typename?: 'ServerConfig';
  bucketName: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  topicName: Scalars['String']['output'];
};

export type TopicSubscription = {
  __typename?: 'TopicSubscription';
  consoleUrl: Scalars['String']['output'];
  hostname?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type UpdateEnvironmentInput = {
  name: Scalars['String']['input'];
  patch: UpdateEnvironmentPatch;
};

export type UpdateEnvironmentPatch = {
  color: Scalars['String']['input'];
};

export type UpdateEnvironmentPayload = {
  __typename?: 'UpdateEnvironmentPayload';
  environment: Environment;
  viewer: Viewer;
};

export type UpdateFeatureFlagInput = {
  generation: Scalars['String']['input'];
  key: Scalars['String']['input'];
  patch: FeatureFlagPatch;
};

export type UpdateFeatureFlagPayload = {
  __typename?: 'UpdateFeatureFlagPayload';
  featureFlag: FeatureFlag;
};

export type Viewer = Node & {
  __typename?: 'Viewer';
  environments: Array<Environment>;
  featureFlag?: Maybe<FeatureFlag>;
  featureFlags: FeatureFlagsConnection;
  id: Scalars['ID']['output'];
  serverConfig: ServerConfig;
  topicSubscriptions: Array<TopicSubscription>;
};


export type ViewerFeatureFlagArgs = {
  key: Scalars['String']['input'];
};


export type ViewerFeatureFlagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  Node: ( FeatureFlagSource ) | ( ViewerSource );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateEnvironmentInput: CreateEnvironmentInput;
  CreateEnvironmentPayload: ResolverTypeWrapper<Omit<CreateEnvironmentPayload, 'viewer'> & { viewer: ResolversTypes['Viewer'] }>;
  CreateFeatureFlagInput: CreateFeatureFlagInput;
  CreateFeatureFlagPayload: ResolverTypeWrapper<Omit<CreateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversTypes['FeatureFlag'] }>;
  Environment: ResolverTypeWrapper<Environment>;
  FeatureFlag: ResolverTypeWrapper<FeatureFlagSource>;
  FeatureFlagPatch: FeatureFlagPatch;
  FeatureFlagType: FeatureFlagType;
  FeatureFlagVariation: ResolverTypeWrapper<FeatureFlagVariation>;
  FeatureFlagVariationInput: FeatureFlagVariationInput;
  FeatureFlagVersion: ResolverTypeWrapper<FeatureFlagVersionSource>;
  FeatureFlagVersionsConnection: ResolverTypeWrapper<FeatureFlagVersionsConnectionSource>;
  FeatureFlagVersionsEdge: ResolverTypeWrapper<File>;
  FeatureFlagsConnection: ResolverTypeWrapper<GetFilesResponse>;
  FeatureFlagsEdge: ResolverTypeWrapper<File>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  ServerConfig: ResolverTypeWrapper<ServerConfigSource>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TopicSubscription: ResolverTypeWrapper<Subscription>;
  UpdateEnvironmentInput: UpdateEnvironmentInput;
  UpdateEnvironmentPatch: UpdateEnvironmentPatch;
  UpdateEnvironmentPayload: ResolverTypeWrapper<Omit<UpdateEnvironmentPayload, 'viewer'> & { viewer: ResolversTypes['Viewer'] }>;
  UpdateFeatureFlagInput: UpdateFeatureFlagInput;
  UpdateFeatureFlagPayload: ResolverTypeWrapper<Omit<UpdateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversTypes['FeatureFlag'] }>;
  VariationByEnvironment: ResolverTypeWrapper<Scalars['VariationByEnvironment']['output']>;
  Viewer: ResolverTypeWrapper<ViewerSource>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CreateEnvironmentInput: CreateEnvironmentInput;
  CreateEnvironmentPayload: Omit<CreateEnvironmentPayload, 'viewer'> & { viewer: ResolversParentTypes['Viewer'] };
  CreateFeatureFlagInput: CreateFeatureFlagInput;
  CreateFeatureFlagPayload: Omit<CreateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversParentTypes['FeatureFlag'] };
  Environment: Environment;
  FeatureFlag: FeatureFlagSource;
  FeatureFlagPatch: FeatureFlagPatch;
  FeatureFlagVariation: FeatureFlagVariation;
  FeatureFlagVariationInput: FeatureFlagVariationInput;
  FeatureFlagVersion: FeatureFlagVersionSource;
  FeatureFlagVersionsConnection: FeatureFlagVersionsConnectionSource;
  FeatureFlagVersionsEdge: File;
  FeatureFlagsConnection: GetFilesResponse;
  FeatureFlagsEdge: File;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  PageInfo: PageInfo;
  Query: {};
  ServerConfig: ServerConfigSource;
  String: Scalars['String']['output'];
  TopicSubscription: Subscription;
  UpdateEnvironmentInput: UpdateEnvironmentInput;
  UpdateEnvironmentPatch: UpdateEnvironmentPatch;
  UpdateEnvironmentPayload: Omit<UpdateEnvironmentPayload, 'viewer'> & { viewer: ResolversParentTypes['Viewer'] };
  UpdateFeatureFlagInput: UpdateFeatureFlagInput;
  UpdateFeatureFlagPayload: Omit<UpdateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversParentTypes['FeatureFlag'] };
  VariationByEnvironment: Scalars['VariationByEnvironment']['output'];
  Viewer: ViewerSource;
};

export type CreateEnvironmentPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateEnvironmentPayload'] = ResolversParentTypes['CreateEnvironmentPayload']> = {
  environment?: Resolver<ResolversTypes['Environment'], ParentType, ContextType>;
  viewer?: Resolver<ResolversTypes['Viewer'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateFeatureFlagPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateFeatureFlagPayload'] = ResolversParentTypes['CreateFeatureFlagPayload']> = {
  featureFlag?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnvironmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Environment'] = ResolversParentTypes['Environment']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlag'] = ResolversParentTypes['FeatureFlag']> = {
  defaultVariation?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  environmentVariations?: Resolver<ResolversTypes['VariationByEnvironment'], ParentType, ContextType>;
  generation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  previousVersions?: Resolver<ResolversTypes['FeatureFlagVersionsConnection'], ParentType, ContextType, RequireFields<FeatureFlagPreviousVersionsArgs, 'first'>>;
  type?: Resolver<ResolversTypes['FeatureFlagType'], ParentType, ContextType>;
  variations?: Resolver<Array<ResolversTypes['FeatureFlagVariation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagVariationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagVariation'] = ResolversParentTypes['FeatureFlagVariation']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagVersionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagVersion'] = ResolversParentTypes['FeatureFlagVersion']> = {
  defaultVariation?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  environmentVariations?: Resolver<ResolversTypes['VariationByEnvironment'], ParentType, ContextType>;
  generation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeDeleted?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variations?: Resolver<Array<ResolversTypes['FeatureFlagVariation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagVersionsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagVersionsConnection'] = ResolversParentTypes['FeatureFlagVersionsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['FeatureFlagVersionsEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['FeatureFlagVersion']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagVersionsEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagVersionsEdge'] = ResolversParentTypes['FeatureFlagVersionsEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['FeatureFlagVersion'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagsConnection'] = ResolversParentTypes['FeatureFlagsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['FeatureFlagsEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['FeatureFlag']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagsEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlagsEdge'] = ResolversParentTypes['FeatureFlagsEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createEnvironment?: Resolver<ResolversTypes['CreateEnvironmentPayload'], ParentType, ContextType, RequireFields<MutationCreateEnvironmentArgs, 'input'>>;
  createFeatureFlag?: Resolver<ResolversTypes['CreateFeatureFlagPayload'], ParentType, ContextType, RequireFields<MutationCreateFeatureFlagArgs, 'input'>>;
  updateEnvironment?: Resolver<ResolversTypes['UpdateEnvironmentPayload'], ParentType, ContextType, RequireFields<MutationUpdateEnvironmentArgs, 'input'>>;
  updateFeatureFlag?: Resolver<ResolversTypes['UpdateFeatureFlagPayload'], ParentType, ContextType, RequireFields<MutationUpdateFeatureFlagArgs, 'input'>>;
};

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'FeatureFlag' | 'Viewer', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  testVariationByEnvironment?: Resolver<Maybe<ResolversTypes['VariationByEnvironment']>, ParentType, ContextType, Partial<QueryTestVariationByEnvironmentArgs>>;
  viewer?: Resolver<ResolversTypes['Viewer'], ParentType, ContextType>;
};

export type ServerConfigResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ServerConfig'] = ResolversParentTypes['ServerConfig']> = {
  bucketName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  topicName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TopicSubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TopicSubscription'] = ResolversParentTypes['TopicSubscription']> = {
  consoleUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateEnvironmentPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateEnvironmentPayload'] = ResolversParentTypes['UpdateEnvironmentPayload']> = {
  environment?: Resolver<ResolversTypes['Environment'], ParentType, ContextType>;
  viewer?: Resolver<ResolversTypes['Viewer'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFeatureFlagPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateFeatureFlagPayload'] = ResolversParentTypes['UpdateFeatureFlagPayload']> = {
  featureFlag?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VariationByEnvironmentScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['VariationByEnvironment'], any> {
  name: 'VariationByEnvironment';
}

export type ViewerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Viewer'] = ResolversParentTypes['Viewer']> = {
  environments?: Resolver<Array<ResolversTypes['Environment']>, ParentType, ContextType>;
  featureFlag?: Resolver<Maybe<ResolversTypes['FeatureFlag']>, ParentType, ContextType, RequireFields<ViewerFeatureFlagArgs, 'key'>>;
  featureFlags?: Resolver<ResolversTypes['FeatureFlagsConnection'], ParentType, ContextType, RequireFields<ViewerFeatureFlagsArgs, 'first'>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  serverConfig?: Resolver<ResolversTypes['ServerConfig'], ParentType, ContextType>;
  topicSubscriptions?: Resolver<Array<ResolversTypes['TopicSubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  CreateEnvironmentPayload?: CreateEnvironmentPayloadResolvers<ContextType>;
  CreateFeatureFlagPayload?: CreateFeatureFlagPayloadResolvers<ContextType>;
  Environment?: EnvironmentResolvers<ContextType>;
  FeatureFlag?: FeatureFlagResolvers<ContextType>;
  FeatureFlagVariation?: FeatureFlagVariationResolvers<ContextType>;
  FeatureFlagVersion?: FeatureFlagVersionResolvers<ContextType>;
  FeatureFlagVersionsConnection?: FeatureFlagVersionsConnectionResolvers<ContextType>;
  FeatureFlagVersionsEdge?: FeatureFlagVersionsEdgeResolvers<ContextType>;
  FeatureFlagsConnection?: FeatureFlagsConnectionResolvers<ContextType>;
  FeatureFlagsEdge?: FeatureFlagsEdgeResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ServerConfig?: ServerConfigResolvers<ContextType>;
  TopicSubscription?: TopicSubscriptionResolvers<ContextType>;
  UpdateEnvironmentPayload?: UpdateEnvironmentPayloadResolvers<ContextType>;
  UpdateFeatureFlagPayload?: UpdateFeatureFlagPayloadResolvers<ContextType>;
  VariationByEnvironment?: GraphQLScalarType;
  Viewer?: ViewerResolvers<ContextType>;
};

