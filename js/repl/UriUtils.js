// @flow

import LZString from "lz-string";

import type { ReplState } from "./types";

const URL_KEYS = [
  "browsers",
  "build",
  "builtIns",
  "corejs",
  "spec",
  "loose",
  "code",
  "debug",
  "forceAllTransforms",
  "shippedProposals",
  "circleciRepo",
  "evaluate",
  "fileSize",
  "timeTravel",
  "sourceType",
  "lineWrap",
  "presets",
  "prettier",
  "targets",
  "version",
  "externalPlugins",
  "assumptions",
];

const compress = (string: string) =>
  LZString.compressToBase64(string)
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); // Remove ending '='

const decompress = (string: string) =>
  LZString.decompressFromBase64(
    string
      .replace(/-/g, "+") // Convert '-' to '+'
      .replace(/_/g, "/") // Convert '_' to '/'
  );

const encode = (value: any) => window.encodeURIComponent(value);

const decode = (value: any) => {
  try {
    return window.decodeURIComponent("" + value);
  } catch (err) {
    return value;
  }
};

const mergeDefinedKeys = (raw: Object, keys: Array<string>, target: Object) => {
  keys.forEach(key => {
    if (raw[key] != null) {
      target[key] = raw[key];
    }
  });
};

const parseQuery = () => {
  const raw = document.location.hash
    .replace(/^#\?/, "")
    .split("&")
    .reduce((reduced: Object, pair: string) => {
      const pieces = pair.split("=");
      const name = decodeURIComponent("" + pieces[0]);

      let value = decodeURIComponent("" + pieces[1]);
      if (value === "true" || value === "false") {
        value = value === "true";
      }

      reduced[name] = value;
      return reduced;
    }, {});

  const state = {};

  mergeDefinedKeys(raw, URL_KEYS, state);

  if (raw.code_lz != null) {
    state.code = decompress(raw.code_lz || "");
  }

  return state;
};

const updateQuery = (state: ReplState) => {
  const query = URL_KEYS.map(key => {
    if (state[key] == null) {
      return null;
    } else if (key === "code") {
      return `${key}_lz=` + compress(state.code);
    } else {
      return key + "=" + encode(state[key]);
    }
  })
    .filter(value => value)
    .join("&");

  window.location.hash = "?" + query;
};

export default {
  compress,
  decode,
  decompress,
  encode,
  parseQuery,
  updateQuery,
};
