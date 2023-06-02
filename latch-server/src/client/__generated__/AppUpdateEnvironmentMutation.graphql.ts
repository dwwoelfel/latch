/**
 * @generated SignedSource<<16e0bbbf6d91ac6b83b8e0f5ced9b71a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateEnvironmentInput = {
  name: string;
  patch: UpdateEnvironmentPatch;
};
export type UpdateEnvironmentPatch = {
  color: string;
};
export type AppUpdateEnvironmentMutation$variables = {
  input: UpdateEnvironmentInput;
};
export type AppUpdateEnvironmentMutation$data = {
  readonly updateEnvironment: {
    readonly viewer: {
      readonly " $fragmentSpreads": FragmentRefs<"AppEnvironmentSelector">;
    };
  };
};
export type AppUpdateEnvironmentMutation = {
  response: AppUpdateEnvironmentMutation$data;
  variables: AppUpdateEnvironmentMutation$variables;
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
    "name": "AppUpdateEnvironmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateEnvironmentPayload",
        "kind": "LinkedField",
        "name": "updateEnvironment",
        "plural": false,
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "AppEnvironmentSelector"
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
    "name": "AppUpdateEnvironmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateEnvironmentPayload",
        "kind": "LinkedField",
        "name": "updateEnvironment",
        "plural": false,
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
                "args": null,
                "concreteType": "Environment",
                "kind": "LinkedField",
                "name": "environments",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "color",
                    "storageKey": null
                  }
                ],
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
    "cacheID": "89f7d25e9d498b56a85359e69c529b8d",
    "id": null,
    "metadata": {},
    "name": "AppUpdateEnvironmentMutation",
    "operationKind": "mutation",
    "text": "mutation AppUpdateEnvironmentMutation(\n  $input: UpdateEnvironmentInput!\n) {\n  updateEnvironment(input: $input) {\n    viewer {\n      ...AppEnvironmentSelector\n      id\n    }\n  }\n}\n\nfragment AppEnvironmentSelector on Viewer {\n  environments {\n    name\n    color\n  }\n}\n"
  }
};
})();

(node as any).hash = "67afc0142d1bde31ca21d9018ceba773";

export default node;
