/**
 * @generated SignedSource<<bfefbc22c057ea8b85f28333b1e5b060>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
export type FeatureFlagType = "BOOL" | "FLOAT" | "INT" | "JSON" | "STRING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type FlagPageHistory$data = {
  readonly currentVariation: number;
  readonly description: string | null;
  readonly id: string;
  readonly previousVersions: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly currentVariation: number;
        readonly description: string | null;
        readonly timeDeleted: string;
        readonly variations: ReadonlyArray<{
          readonly description: string | null;
          readonly value: any;
        }>;
      };
    }>;
  };
  readonly type: FeatureFlagType;
  readonly variations: ReadonlyArray<{
    readonly description: string | null;
    readonly value: any;
  }>;
  readonly " $fragmentType": "FlagPageHistory";
};
export type FlagPageHistory$key = {
  readonly " $data"?: FlagPageHistory$data;
  readonly " $fragmentSpreads": FragmentRefs<"FlagPageHistory">;
};

import FlagPageHistoryPaginationQuery_graphql from './FlagPageHistoryPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "previousVersions"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v2 = {
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
    (v1/*: any*/)
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentVariation",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 5,
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
        "node"
      ],
      "operation": FlagPageHistoryPaginationQuery_graphql,
      "identifierField": "id"
    }
  },
  "name": "FlagPageHistory",
  "selections": [
    {
      "alias": "previousVersions",
      "args": null,
      "concreteType": "FeatureFlagVersionsConnection",
      "kind": "LinkedField",
      "name": "__FlagPage_previousVersions_connection",
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
                (v1/*: any*/),
                (v2/*: any*/),
                (v3/*: any*/),
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
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    (v1/*: any*/),
    (v2/*: any*/),
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "FeatureFlag",
  "abstractKey": null
};
})();

(node as any).hash = "18cc647c00e89d52626fa6538ddfc742";

export default node;
