/**
 * @generated SignedSource<<b96a9926664297cbd0d0ff9f210db11b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FlagPageEnvironments$data = {
  readonly environments: ReadonlyArray<{
    readonly color: string;
    readonly name: string;
  }>;
  readonly " $fragmentType": "FlagPageEnvironments";
};
export type FlagPageEnvironments$key = {
  readonly " $data"?: FlagPageEnvironments$data;
  readonly " $fragmentSpreads": FragmentRefs<"FlagPageEnvironments">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FlagPageEnvironments",
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
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "36f92e827b50f8a8ebf777ee81a8fbe1";

export default node;
