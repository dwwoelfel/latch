/**
 * @generated SignedSource<<bae8bc2b9548e4e323e0761d114af5c9>>
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
  readonly currentVariation: number;
  readonly description: string | null;
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
      "name": "currentVariation",
      "storageKey": null
    }
  ],
  "type": "FeatureFlag",
  "abstractKey": null
};

(node as any).hash = "8d725ad98999334820528316cfcc4d02";

export default node;
