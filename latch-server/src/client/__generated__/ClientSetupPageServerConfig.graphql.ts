/**
 * @generated SignedSource<<88fe44579ca470696deb1d3a14c09827>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClientSetupPageServerConfig$data = {
  readonly serverConfig: {
    readonly bucketName: string;
    readonly projectId: string;
    readonly topicName: string;
  };
  readonly " $fragmentType": "ClientSetupPageServerConfig";
};
export type ClientSetupPageServerConfig$key = {
  readonly " $data"?: ClientSetupPageServerConfig$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClientSetupPageServerConfig">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientSetupPageServerConfig",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ServerConfig",
      "kind": "LinkedField",
      "name": "serverConfig",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "bucketName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "topicName",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "7a399b14b29846147f3b6faca4547480";

export default node;
