/**
 * @generated SignedSource<<a89e118b4c69e01d91dd9e1ba144faf1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateEnvironmentInput = {
  color: string;
  name: string;
};
export type CreateEnvironmentFormMutation$variables = {
  input: CreateEnvironmentInput;
};
export type CreateEnvironmentFormMutation$data = {
  readonly createEnvironment: {
    readonly environment: {
      readonly name: string;
    };
    readonly viewer: {
      readonly " $fragmentSpreads": FragmentRefs<"AppEnvironmentSelector">;
    };
  };
};
export type CreateEnvironmentFormMutation = {
  response: CreateEnvironmentFormMutation$data;
  variables: CreateEnvironmentFormMutation$variables;
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Environment",
  "kind": "LinkedField",
  "name": "environment",
  "plural": false,
  "selections": [
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CreateEnvironmentFormMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateEnvironmentPayload",
        "kind": "LinkedField",
        "name": "createEnvironment",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
    "name": "CreateEnvironmentFormMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateEnvironmentPayload",
        "kind": "LinkedField",
        "name": "createEnvironment",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
                  (v2/*: any*/),
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
    "cacheID": "759139f3a24f16d784c999b6637f1812",
    "id": null,
    "metadata": {},
    "name": "CreateEnvironmentFormMutation",
    "operationKind": "mutation",
    "text": "mutation CreateEnvironmentFormMutation(\n  $input: CreateEnvironmentInput!\n) {\n  createEnvironment(input: $input) {\n    environment {\n      name\n    }\n    viewer {\n      ...AppEnvironmentSelector\n      id\n    }\n  }\n}\n\nfragment AppEnvironmentSelector on Viewer {\n  environments {\n    name\n    color\n  }\n}\n"
  }
};
})();

(node as any).hash = "8abc32b233d8548c25acde11bef46bfd";

export default node;
