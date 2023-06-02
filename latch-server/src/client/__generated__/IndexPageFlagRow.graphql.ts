/**
 * @generated SignedSource<<767759e38ba40c69d73745566087ed55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type FeatureFlagType = "BOOL" | "FLOAT" | "INT" | "JSON" | "STRING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IndexPageFlagRow$data = {
  readonly defaultVariation: number;
  readonly description: string | null;
  readonly environmentVariations: Record<string, number>;
  readonly generation: string;
  readonly key: string;
  readonly type: FeatureFlagType;
  readonly variations: ReadonlyArray<{
    readonly value: any;
  }>;
  readonly " $fragmentType": "IndexPageFlagRow";
};
export type IndexPageFlagRow$key = {
  readonly " $data"?: IndexPageFlagRow$data;
  readonly " $fragmentSpreads": FragmentRefs<"IndexPageFlagRow">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IndexPageFlagRow",
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
      "name": "defaultVariation",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "environmentVariations",
      "storageKey": null
    }
  ],
  "type": "FeatureFlag",
  "abstractKey": null
};

(node as any).hash = "586b761e049cc15e8f1d0802f8dace5c";

export default node;
