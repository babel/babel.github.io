---
id: babel-plugin-syntax-pipeline-operator
title: @babel/plugin-syntax-pipeline-operator
sidebar_label: syntax-pipeline-operator
---

> #### Syntax only
>
> It's unlikely you want to use this plugin directly as it only enables Babel to parse this syntax. Instead, use [plugin-proposal-pipeline-operator](plugin-proposal-pipeline-operator.md) to _both_ parse and transform this syntax.

## Installation

```sh
$ npm install @babel/plugin-syntax-pipeline-operator
```

## Usage

### With a configuration file (Recommended)

For [minimal F# pipes](https://github.com/tc39/proposal-pipeline-operator/):

```json
{
  "plugins": [
    [ "@babel/plugin-syntax-pipeline-operator", { "proposal": "minimal" } ]
  ]
}
```

For [F# pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines/):

```json
{
  "plugins": [
    [ "@babel/plugin-syntax-pipeline-operator", { "proposal": "fsharp" } ]
  ]
}
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `%` topic token:

```json
{
  "plugins": [
    [ "@babel/plugin-syntax-pipeline-operator", { "proposal": "hack", "topicToken": "%" } ]
  ]
}
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `#` topic token:

```json
{
  "plugins": [
    [ "@babel/plugin-syntax-pipeline-operator", { "proposal": "hack", "topicToken": "#" } ]
  ]
}
```

### Via CLI

Because this plugin requires a configuration option, it [cannot be directly configured from the CLI](https://github.com/babel/babel/issues/4161). Use a [config file](/docs/en/config-files) instead with the CLI, to add and configure this plugin.

### Via Node API

For [minimal F# pipes](https://github.com/tc39/proposal-pipeline-operator/):

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-syntax-pipeline-operator", { proposal: "minimal" } ],
  ],
});
```

For [F# pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines/):

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-syntax-pipeline-operator", { proposal: "fsharp" } ],
  ],
});
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `%` topic token:

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-syntax-pipeline-operator", { proposal: "hack", topicToken: "%" } ],
  ],
});
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `#` topic token:

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-syntax-pipeline-operator", { proposal: "hack", topicToken: "#" } ],
  ],
});
```
