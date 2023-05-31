/**
 * @generated SignedSource<<0593b8d35574edfc6039276893b6c0b2>>
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
  currentVariation?: number | null;
  description?: string | null;
  variations?: ReadonlyArray<FeatureFlagVariationInput> | null;
};
export type FeatureFlagVariationInput = {
  description?: string | null;
  value: any;
};
export type IndexPageUpdateFlagMutation$variables = {
  input: UpdateFeatureFlagInput;
};
export type IndexPageUpdateFlagMutation$data = {
  readonly updateFeatureFlag: {
    readonly featureFlag: {
      readonly " $fragmentSpreads": FragmentRefs<"IndexPageFlagRow">;
    };
  };
};
export type IndexPageUpdateFlagMutation = {
  response: IndexPageUpdateFlagMutation$data;
  variables: IndexPageUpdateFlagMutation$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IndexPageUpdateFlagMutation",
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
    "name": "IndexPageUpdateFlagMutation",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "currentVariation",
                "storageKey": null
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
    "cacheID": "94bf8f3308679ee488b768266a698093",
    "id": null,
    "metadata": {},
    "name": "IndexPageUpdateFlagMutation",
    "operationKind": "mutation",
    "text": "mutation IndexPageUpdateFlagMutation(\n  $input: UpdateFeatureFlagInput!\n) {\n  updateFeatureFlag(input: $input) {\n    featureFlag {\n      ...IndexPageFlagRow\n      id\n    }\n  }\n}\n\nfragment IndexPageFlagRow on FeatureFlag {\n  key\n  type\n  description\n  generation\n  variations {\n    value\n  }\n  currentVariation\n}\n"
  }
};
})();

(node as any).hash = "0af0cd9bc542578bcc6f7ac1a43a9c66";

export default node;
