---
id: babel-plugin-proposal-pipeline-operator
title: @babel/plugin-proposal-pipeline-operator
sidebar_label: pipeline-operator
---

## Installation

```sh
$ npm install --save-dev @babel/plugin-proposal-pipeline-operator
```

## Usage

The pipeline operator has several competing proposals.
Configure which proposal to use with the required `"proposal"` option.

| Value | Proposal | Version added |
| ----- | -------- | ------------- |
| `"minimal"` | [Minimal F#-style pipes](https://github.com/tc39/proposal-pipeline-operator/) | `v7.0.0`
| `"fsharp"` | [F#-style pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines) | `v7.5.0`
| `"hack"` | [Hack-style pipes](https://github.com/js-choi/proposal-hack-pipes) | `v7.15.0`
| ~~`"smart"`~~ | [Smart-mix pipes](https://github.com/js-choi/proposal-smart-pipelines) (deprecated) | `v7.3.0`

If `"proposal": "hack"` is used, then a `"topicToken": "%"` or `"topicToken": "#"` option must also be included.

The `"proposal": "smart"` option is deprecated and subject to removal in a future major version.

When TC39 accepts one of the proposals, that proposal will become the default and the `"proposal"` option will no longer be required.

### Summary of proposals’ behavior

<table>
<thead>
<tr>
<th>Original expression</th>
<th>

[Minimal F# pipes](https://github.com/tc39/proposal-pipeline-operator/)<br>`{proposal: "minimal"}`

</th>
<th>

[F# pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines/)<br>`{proposal: "fsharp"}`

</th>
<th>

[Hack pipes](https://github.com/js-choi/proposal-hack-pipes/)<br>`{proposal: "hack",`<br>`topicToken: "%"}`

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`o.m(x)`

</td>
<td>

`x |> o.m`

</td>
<td>

`x |> o.m`

</td>
<td>

`x |> o.m(%)`

</td>
</tr>
<tr>
<td>

`o.m(0, x)`

</td>
<td>

`x |> y=>o.m(0, y)`

</td>
<td>

`x |> y=>o.m(0, y)`

</td>
<td>

`x |> o.m(0, %)`

</td>
</tr>
<tr>
<td>

`new o.m(x)`

</td>
<td>

`x |> y=>new o.m(y)`

</td>
<td>

`x |> y=>new o.m(y)`

</td>
<td>

`x |> new o.m(%)`

</td>
</tr>
<tr>
<td>

`o[x]`

</td>
<td>

`x |> y=>o[x]`

</td>
<td>

`x |> y=>o[y]`

</td>
<td>

`x |> o[%]`

</td>
</tr>
<tr>
<td>

`x[i]`

</td>
<td>

`x |> y=>x[i]`

</td>
<td>

`x |> y=>y[i]`

</td>
<td>

`x |> %[i]`

</td>
</tr>
<tr>
<td>

`x + 1`

</td>
<td>

`x |> y=>y + 1`

</td>
<td>

`x |> y=>y + 1`

</td>
<td>

`x |> % + 1`

</td>
</tr>
<tr>
<td>

`[0, x]`

</td>
<td>

`x |> y=>[0, y]`

</td>
<td>

`x |> y=>[0, y]`

</td>
<td>

`x |> [0, %]`

</td>
</tr>
<tr>
<td>

`{ key: x }`

</td>
<td>

`x |> y=>({ key: y })`

</td>
<td>

`x |> y=>({ key: y })`

</td>
<td>

`x |> { key: % }`

</td>
</tr>
<tr>
<td>

`await o.m(x)`

</td>
<td>Not supported</td>
<td>

`x |> o.m |> await`

</td>
<td>

`x |> await o.m(%)`

</td>
</tr>
<tr>
<td>

`yield o.m(x)`

</td>
<td>Not supported</td>
<td>Not supported</td>
<td>

`x |> (yield o.m(%))`

</td>
</tr>
</tbody>
</table>

### With a configuration file (Recommended)

For [minimal F# pipes](https://github.com/tc39/proposal-pipeline-operator/):

```json
{
  "plugins": [
    ["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }]
  ]
}
```

For [F# pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines/):

```json
{
  "plugins": [
    ["@babel/plugin-proposal-pipeline-operator", { "proposal": "fsharp" }]
  ]
}
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `%` topic token:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-pipeline-operator", { "proposal": "hack", "topicToken": "%" }]
  ]
}
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `#` topic token:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-pipeline-operator", { "proposal": "hack", "topicToken": "#" }]
  ]
}
```

### Via CLI

Because this plugin requires a configuration option, it [cannot be directly configured from the CLI](https://github.com/babel/babel/issues/4161). Use a [config file](/docs/en/config-files) instead with the CLI, to add and configure this plugin.

### Via Node API

For [minimal F# pipes](https://github.com/tc39/proposal-pipeline-operator/)<br>`{proposal: "minimal"}`:

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" } ],
  ],
});
```

For [F# pipes with `await`](https://github.com/valtech-nyc/proposal-fsharp-pipelines/):

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-proposal-pipeline-operator", { proposal: "fsharp" } ],
  ],
});
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `%` topic token:

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-proposal-pipeline-operator", { proposal: "hack", topicToken: "%" } ],
  ],
});
```

For [Hack pipes](https://github.com/js-choi/proposal-hack-pipes/) with `#` topic token:

```javascript
require("@babel/core").transformSync("code", {
  plugins: [
    [ "@babel/plugin-proposal-pipeline-operator", { proposal: "hack", topicToken: "#" } ],
  ],
});
```
