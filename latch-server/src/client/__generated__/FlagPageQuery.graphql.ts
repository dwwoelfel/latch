/**
 * @generated SignedSource<<ea6b1caba34ea6b40960b3638d69b87a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FlagPageQuery$variables = {
  key: string;
};
export type FlagPageQuery$data = {
  readonly featureFlag: {
    readonly " $fragmentSpreads": FragmentRefs<"FlagPageFlag">;
  } | null;
};
export type FlagPageQuery = {
  response: FlagPageQuery$data;
  variables: FlagPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "key"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "key",
    "variableName": "key"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v3 = {
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
    },
    (v2/*: any*/)
  ],
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentVariation",
  "storageKey": null
},
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 5
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FlagPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "FeatureFlag",
        "kind": "LinkedField",
        "name": "featureFlag",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FlagPageFlag"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FlagPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "FeatureFlag",
        "kind": "LinkedField",
        "name": "featureFlag",
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
            "name": "generation",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
            "storageKey": null
          },
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "FeatureFlagVersionsConnection",
            "kind": "LinkedField",
            "name": "previousVersions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FeatureFlagVersionsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FeatureFlagVersion",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "timeDeleted",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
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
            "storageKey": "previousVersions(first:5)"
          },
          {
            "alias": null,
            "args": (v5/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "FlagPage_previousVersions",
            "kind": "LinkedHandle",
            "name": "previousVersions"
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "df512e1b548ab2fccab22a9157fa5222",
    "id": null,
    "metadata": {},
    "name": "FlagPageQuery",
    "operationKind": "query",
    "text": "query FlagPageQuery(\n  $key: String!\n) {\n  featureFlag(key: $key) {\n    ...FlagPageFlag\n    id\n  }\n}\n\nfragment FlagPageFlag on FeatureFlag {\n  key\n  generation\n  type\n  description\n  variations {\n    value\n    description\n  }\n  currentVariation\n  ...FlagPageHistory\n}\n\nfragment FlagPageHistory on FeatureFlag {\n  previousVersions(first: 5) {\n    edges {\n      cursor\n      node {\n        description\n        variations {\n          value\n          description\n        }\n        currentVariation\n        timeDeleted\n        __typename\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  type\n  description\n  variations {\n    value\n    description\n  }\n  currentVariation\n  id\n}\n"
  }
};
})();

(node as any).hash = "4ae0dca6dbde08b3ed7af2ed36a2044c";

export default node;
