/**
 * @generated SignedSource<<e24803c9590d56f7939cbe0816efa2c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
export type FeatureFlagType = "BOOL" | "FLOAT" | "INT" | "JSON" | "STRING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ClientSetupPageFlags$data = {
  readonly featureFlags: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly defaultVariation: number;
        readonly environmentVariations: Record<string, number>;
        readonly key: string;
        readonly type: FeatureFlagType;
        readonly variations: ReadonlyArray<{
          readonly value: any;
        }>;
      };
    }>;
  };
  readonly " $fragmentType": "ClientSetupPageFlags";
};
export type ClientSetupPageFlags$key = {
  readonly " $data"?: ClientSetupPageFlags$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClientSetupPageFlags">;
};

import ClientSetupPageFlagsPaginationQuery_graphql from './ClientSetupPageFlagsPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "featureFlags"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 1000,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "viewer"
      ],
      "operation": ClientSetupPageFlagsPaginationQuery_graphql
    }
  },
  "name": "ClientSetupPageFlags",
  "selections": [
    {
      "alias": "featureFlags",
      "args": null,
      "concreteType": "FeatureFlagsConnection",
      "kind": "LinkedField",
      "name": "__ClientSetupPage_featureFlags_connection",
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
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};
})();

(node as any).hash = "ab3c33bd25c7d046dd441ebdef31cef1";

export default node;
