---
id: babel-plugin-proposal-pipeline-operator
title: @babel/plugin-proposal-pipeline-operator
sidebar_label: proposal-pipeline-operator
---

## Installation

```sh
$ npm install --save-dev @babel/plugin-proposal-pipeline-operator
```

## Usage

### With a configuration file (Recommended)

```json
{
  "plugins": [["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }]]
}
```

The Pipeline Proposal is one of three competing implementations. Which implementation the plugin should use is configured with the `"proposal"` option. This option is required and should be one of:

* `"hack"` - [Hack-Style Only](https://github.com/tc39/proposal-pipeline-operator/wiki#proposal-2-hack-style-only)
* `"minimal"` – [Minimal - F#-Style](https://github.com/tc39/proposal-pipeline-operator/wiki#proposal0-original-minimal-proposal)
* `"fsharp"` - [F#-Style with await](https://github.com/valtech-nyc/proposal-fsharp-pipelines) ([wiki](https://github.com/tc39/proposal-pipeline-operator/wiki#proposal-1-f-sharp-style-only-with-await))
* `"smart"` - [Smart - Combination of Hack and F# Styles](https://github.com/js-choi/proposal-smart-pipelines) ([wiki](https://github.com/tc39/proposal-pipeline-operator/wiki#proposal-4-smart-mix))

When one of the implementations is accepted, it will become the default and the `"proposal"` option will no longer be required.

### Via CLI

```sh
$ babel --plugins @babel/plugin-proposal-pipeline-operator script.js
```

### Via Node API

```javascript
require("@babel/core").transform("code", {
  plugins: ["@babel/plugin-proposal-pipeline-operator"]
});
```
