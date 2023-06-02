/**
 * @generated SignedSource<<0f40b6eadd3ee905f8921b559006bd64>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type NewFlagPageQuery$variables = {};
export type NewFlagPageQuery$data = {
  readonly viewer: {
    readonly environments: ReadonlyArray<{
      readonly color: string;
      readonly name: string;
    }>;
  };
};
export type NewFlagPageQuery = {
  response: NewFlagPageQuery$data;
  variables: NewFlagPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NewFlagPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "NewFlagPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "8672ad614e81a7ff74e6d64b8ac198f0",
    "id": null,
    "metadata": {},
    "name": "NewFlagPageQuery",
    "operationKind": "query",
    "text": "query NewFlagPageQuery {\n  viewer {\n    environments {\n      name\n      color\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "31c776bae67e8d836e9530492cb61b22";

export default node;
