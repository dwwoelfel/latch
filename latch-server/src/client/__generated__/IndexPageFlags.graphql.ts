/**
 * @generated SignedSource<<cb4cb6544cb581133baabfe6ee8f61ba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IndexPageFlags$data = {
  readonly featureFlags: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly key: string;
        readonly " $fragmentSpreads": FragmentRefs<"IndexPageFlagRow">;
      };
    }>;
  };
  readonly " $fragmentType": "IndexPageFlags";
};
export type IndexPageFlags$key = {
  readonly " $data"?: IndexPageFlags$data;
  readonly " $fragmentSpreads": FragmentRefs<"IndexPageFlags">;
};

import IndexPageFlagsPaginationQuery_graphql from './IndexPageFlagsPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "featureFlags"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
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
      "fragmentPathInResult": [],
      "operation": IndexPageFlagsPaginationQuery_graphql
    }
  },
  "name": "IndexPageFlags",
  "selections": [
    {
      "alias": "featureFlags",
      "args": null,
      "concreteType": "FeatureFlagsConnection",
      "kind": "LinkedField",
      "name": "__IndexPage_featureFlags_connection",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "IndexPageFlagRow"
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
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "6011efa3e738c5d033c179e0e979fd51";

export default node;
