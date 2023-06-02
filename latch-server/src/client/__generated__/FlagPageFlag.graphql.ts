/**
 * @generated SignedSource<<0fb042c960b0acc98d850925f3d4a0f5>>
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
  readonly defaultVariation: number;
  readonly description: string | null;
  readonly environmentVariations: Record<string, number>;
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "FlagPageHistory"
    }
  ],
  "type": "FeatureFlag",
  "abstractKey": null
};
})();

(node as any).hash = "17a699dc3129d6811f556ca20765ea4e";

export default node;
