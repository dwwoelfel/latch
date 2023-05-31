import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { FeatureFlagSource, FeatureFlagVersionSource, FeatureFlagVersionsConnectionSource, Context } from './schema';
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
};

export type CreateFeatureFlagInput = {
  currentVariation: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  type: FeatureFlagType;
  variations: Array<FeatureFlagVariationInput>;
};

export type CreateFeatureFlagPayload = {
  __typename?: 'CreateFeatureFlagPayload';
  featureFlag: FeatureFlag;
};

export type FeatureFlag = Node & {
  __typename?: 'FeatureFlag';
  currentVariation: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
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
  currentVariation?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
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
  currentVariation: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
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
  createFeatureFlag: CreateFeatureFlagPayload;
  updateFeatureFlag: UpdateFeatureFlagPayload;
};


export type MutationCreateFeatureFlagArgs = {
  input: CreateFeatureFlagInput;
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
  featureFlag?: Maybe<FeatureFlag>;
  featureFlags: FeatureFlagsConnection;
  node?: Maybe<Node>;
};


export type QueryFeatureFlagArgs = {
  key: Scalars['String']['input'];
};


export type QueryFeatureFlagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
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
  Node: ( FeatureFlagSource );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateFeatureFlagInput: CreateFeatureFlagInput;
  CreateFeatureFlagPayload: ResolverTypeWrapper<Omit<CreateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversTypes['FeatureFlag'] }>;
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
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateFeatureFlagInput: UpdateFeatureFlagInput;
  UpdateFeatureFlagPayload: ResolverTypeWrapper<Omit<UpdateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversTypes['FeatureFlag'] }>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CreateFeatureFlagInput: CreateFeatureFlagInput;
  CreateFeatureFlagPayload: Omit<CreateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversParentTypes['FeatureFlag'] };
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
  String: Scalars['String']['output'];
  UpdateFeatureFlagInput: UpdateFeatureFlagInput;
  UpdateFeatureFlagPayload: Omit<UpdateFeatureFlagPayload, 'featureFlag'> & { featureFlag: ResolversParentTypes['FeatureFlag'] };
};

export type CreateFeatureFlagPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateFeatureFlagPayload'] = ResolversParentTypes['CreateFeatureFlagPayload']> = {
  featureFlag?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeatureFlag'] = ResolversParentTypes['FeatureFlag']> = {
  currentVariation?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  currentVariation?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  createFeatureFlag?: Resolver<ResolversTypes['CreateFeatureFlagPayload'], ParentType, ContextType, RequireFields<MutationCreateFeatureFlagArgs, 'input'>>;
  updateFeatureFlag?: Resolver<ResolversTypes['UpdateFeatureFlagPayload'], ParentType, ContextType, RequireFields<MutationUpdateFeatureFlagArgs, 'input'>>;
};

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'FeatureFlag', ParentType, ContextType>;
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
  featureFlag?: Resolver<Maybe<ResolversTypes['FeatureFlag']>, ParentType, ContextType, RequireFields<QueryFeatureFlagArgs, 'key'>>;
  featureFlags?: Resolver<ResolversTypes['FeatureFlagsConnection'], ParentType, ContextType, RequireFields<QueryFeatureFlagsArgs, 'first'>>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
};

export type UpdateFeatureFlagPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateFeatureFlagPayload'] = ResolversParentTypes['UpdateFeatureFlagPayload']> = {
  featureFlag?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  CreateFeatureFlagPayload?: CreateFeatureFlagPayloadResolvers<ContextType>;
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
  UpdateFeatureFlagPayload?: UpdateFeatureFlagPayloadResolvers<ContextType>;
};

