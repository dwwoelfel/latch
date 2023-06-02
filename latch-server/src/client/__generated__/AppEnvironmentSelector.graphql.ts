/**
 * @generated SignedSource<<1e7d324c625d68e9ddfdb50f6df4f5c9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AppEnvironmentSelector$data = {
  readonly environments: ReadonlyArray<{
    readonly color: string;
    readonly name: string;
  }>;
  readonly " $fragmentType": "AppEnvironmentSelector";
};
export type AppEnvironmentSelector$key = {
  readonly " $data"?: AppEnvironmentSelector$data;
  readonly " $fragmentSpreads": FragmentRefs<"AppEnvironmentSelector">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AppEnvironmentSelector",
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

(node as any).hash = "3d6e491af100a06e0b76351fa2c5c9b7";

export default node;
