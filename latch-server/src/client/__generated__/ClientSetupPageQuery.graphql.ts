/**
 * @generated SignedSource<<df4a4cbcbd34f7e788ffc0412fc90da0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClientSetupPageQuery$variables = {};
export type ClientSetupPageQuery$data = {
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"ClientSetupPageFlags" | "ClientSetupPageServerConfig">;
  };
};
export type ClientSetupPageQuery = {
  response: ClientSetupPageQuery$data;
  variables: ClientSetupPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1000
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientSetupPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "count",
                "value": 1000
              }
            ],
            "kind": "FragmentSpread",
            "name": "ClientSetupPageFlags"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ClientSetupPageServerConfig"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClientSetupPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": "FeatureFlagsConnection",
            "kind": "LinkedField",
            "name": "featureFlags",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FeatureFlagsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FeatureFlag",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "defaultVariation",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "environmentVariations",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FeatureFlagVariation",
                        "kind": "LinkedField",
                        "name": "variations",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "value",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "featureFlags(first:1000)"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "ClientSetupPage_featureFlags",
            "kind": "LinkedHandle",
            "name": "featureFlags"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ServerConfig",
            "kind": "LinkedField",
            "name": "serverConfig",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "projectId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bucketName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "topicName",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ace6db5f64bcc3ab506823f27a7b46c4",
    "id": null,
    "metadata": {},
    "name": "ClientSetupPageQuery",
    "operationKind": "query",
    "text": "query ClientSetupPageQuery {\n  viewer {\n    ...ClientSetupPageFlags_44sUuY\n    ...ClientSetupPageServerConfig\n    id\n  }\n}\n\nfragment ClientSetupPageFlags_44sUuY on Viewer {\n  featureFlags(first: 1000) {\n    edges {\n      node {\n        key\n        type\n        defaultVariation\n        environmentVariations\n        variations {\n          value\n        }\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment ClientSetupPageServerConfig on Viewer {\n  serverConfig {\n    projectId\n    bucketName\n    topicName\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f1a8cea754e2cfbf067e6aeb3eaab79";

export default node;
