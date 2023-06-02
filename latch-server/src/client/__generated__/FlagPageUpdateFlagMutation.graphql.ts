/**
 * @generated SignedSource<<dcd6a03c753737141a1d7309fd3df018>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateFeatureFlagInput = {
  generation: string;
  key: string;
  patch: FeatureFlagPatch;
};
export type FeatureFlagPatch = {
  defaultVariation?: number | null;
  description?: string | null;
  environmentVariations?: Record<string, number> | null;
  variations?: ReadonlyArray<FeatureFlagVariationInput> | null;
};
export type FeatureFlagVariationInput = {
  description?: string | null;
  value: any;
};
export type FlagPageUpdateFlagMutation$variables = {
  input: UpdateFeatureFlagInput;
};
export type FlagPageUpdateFlagMutation$data = {
  readonly updateFeatureFlag: {
    readonly featureFlag: {
      readonly " $fragmentSpreads": FragmentRefs<"FlagPageFlag" | "IndexPageFlagRow">;
    };
  };
};
export type FlagPageUpdateFlagMutation = {
  response: FlagPageUpdateFlagMutation$data;
  variables: FlagPageUpdateFlagMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
  "name": "defaultVariation",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "environmentVariations",
  "storageKey": null
},
v6 = [
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
    "name": "FlagPageUpdateFlagMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateFeatureFlagPayload",
        "kind": "LinkedField",
        "name": "updateFeatureFlag",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "FeatureFlag",
            "kind": "LinkedField",
            "name": "featureFlag",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IndexPageFlagRow"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "FlagPageFlag"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FlagPageUpdateFlagMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateFeatureFlagPayload",
        "kind": "LinkedField",
        "name": "updateFeatureFlag",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
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
                "name": "type",
                "storageKey": null
              },
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "generation",
                "storageKey": null
              },
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": (v6/*: any*/),
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
                          (v5/*: any*/),
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
                "args": (v6/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "69e0e4b05d60c7d36bc71eb81cd6b926",
    "id": null,
    "metadata": {},
    "name": "FlagPageUpdateFlagMutation",
    "operationKind": "mutation",
    "text": "mutation FlagPageUpdateFlagMutation(\n  $input: UpdateFeatureFlagInput!\n) {\n  updateFeatureFlag(input: $input) {\n    featureFlag {\n      ...IndexPageFlagRow\n      ...FlagPageFlag\n      id\n    }\n  }\n}\n\nfragment FlagPageFlag on FeatureFlag {\n  key\n  generation\n  type\n  description\n  variations {\n    value\n    description\n  }\n  defaultVariation\n  environmentVariations\n  ...FlagPageHistory\n}\n\nfragment FlagPageHistory on FeatureFlag {\n  previousVersions(first: 5) {\n    edges {\n      cursor\n      node {\n        description\n        variations {\n          value\n          description\n        }\n        defaultVariation\n        environmentVariations\n        timeDeleted\n        __typename\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  type\n  description\n  variations {\n    value\n    description\n  }\n  defaultVariation\n  environmentVariations\n  id\n}\n\nfragment IndexPageFlagRow on FeatureFlag {\n  key\n  type\n  description\n  generation\n  variations {\n    value\n  }\n  defaultVariation\n  environmentVariations\n}\n"
  }
};
})();

(node as any).hash = "43d23fb5e01f3882f589c0c481a37027";

export default node;
