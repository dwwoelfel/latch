/**
 * @generated SignedSource<<dbcac055e5307cea96589e7c85fa0ce8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FeatureFlagType = "BOOL" | "FLOAT" | "INT" | "JSON" | "STRING" | "%future added value";
export type CreateFeatureFlagInput = {
  currentVariation: number;
  description?: string | null;
  key: string;
  type: FeatureFlagType;
  variations: ReadonlyArray<FeatureFlagVariationInput>;
};
export type FeatureFlagVariationInput = {
  description?: string | null;
  value: any;
};
export type NewFlagPageCreateFlagMutation$variables = {
  input: CreateFeatureFlagInput;
};
export type NewFlagPageCreateFlagMutation$data = {
  readonly createFeatureFlag: {
    readonly featureFlag: {
      readonly key: string;
    };
  };
};
export type NewFlagPageCreateFlagMutation = {
  response: NewFlagPageCreateFlagMutation$data;
  variables: NewFlagPageCreateFlagMutation$variables;
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
  "name": "key",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NewFlagPageCreateFlagMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateFeatureFlagPayload",
        "kind": "LinkedField",
        "name": "createFeatureFlag",
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
              (v2/*: any*/)
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
    "name": "NewFlagPageCreateFlagMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateFeatureFlagPayload",
        "kind": "LinkedField",
        "name": "createFeatureFlag",
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
              (v2/*: any*/),
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
    "cacheID": "4e655057b2fbccad083532b215523da9",
    "id": null,
    "metadata": {},
    "name": "NewFlagPageCreateFlagMutation",
    "operationKind": "mutation",
    "text": "mutation NewFlagPageCreateFlagMutation(\n  $input: CreateFeatureFlagInput!\n) {\n  createFeatureFlag(input: $input) {\n    featureFlag {\n      key\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "761a46374560d1bd4ac00c6f42ec5652";

export default node;
