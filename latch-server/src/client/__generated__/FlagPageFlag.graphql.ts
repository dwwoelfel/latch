/**
 * @generated SignedSource<<36f4bd79a8f7b63e9d2bc6b3dc36b1bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type FeatureFlagType = "BOOL" | "FLOAT" | "INT" | "JSON" | "STRING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type FlagPageFlag$data = {
  readonly currentVariation: number;
  readonly description: string | null;
  readonly generation: string;
  readonly key: string;
  readonly type: FeatureFlagType;
  readonly variations: ReadonlyArray<{
    readonly description: string | null;
    readonly value: any;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"FlagPageHistory">;
  readonly " $fragmentType": "FlagPageFlag";
};
export type FlagPageFlag$key = {
  readonly " $data"?: FlagPageFlag$data;
  readonly " $fragmentSpreads": FragmentRefs<"FlagPageFlag">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FlagPageFlag",
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
      "name": "generation",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    (v0/*: any*/),
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
        },
        (v0/*: any*/)
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "FlagPageHistory"
    }
  ],
  "type": "FeatureFlag",
  "abstractKey": null
};
})();

(node as any).hash = "f70e6a7a60ea40df3f88c5a64ce475a9";

export default node;
