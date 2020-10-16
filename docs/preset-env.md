---
id: babel-preset-env
title: @babel/preset-env
sidebar_label: env
---

`@babel/preset-env` is a smart preset that allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills) are needed by your target environment(s). This both makes your life easier and JavaScript bundles smaller!

- [Install](#install)
- [How Does it Work?](#how-does-it-work)
- [Browserslist Integration](#browserslist-integration)
- [Options](#options)

## Install

With [npm](https://www.npmjs.com):

```sh
npm install --save-dev @babel/preset-env
```

Or [yarn](https://yarnpkg.com):

```sh
yarn add @babel/preset-env --dev
```

## How Does it Work?

`@babel/preset-env` would not be possible if not for a number of awesome open-source projects, like [`browserslist`](https://github.com/browserslist/browserslist), [`compat-table`](https://github.com/kangax/compat-table), and [`electron-to-chromium`](https://github.com/Kilian/electron-to-chromium).

We leverage these data sources to maintain [mappings of which version](https://github.com/babel/babel/blob/master/packages/babel-compat-data/data/plugins.json) of our supported target environments gained support of a JavaScript syntax or browser feature, as well as a mapping of those syntaxes and features to Babel transform plugins and core-js polyfills.

> It is important to note that `@babel/preset-env` does _not_ support `stage-x` plugins.

`@babel/preset-env` takes any [target environments you've specified](#targets) and checks them against its mappings to compile a list of plugins and passes it to Babel.

## Browserslist Integration

For browser- or Electron-based projects, we recommend using a [`.browserslistrc`](https://github.com/browserslist/browserslist) file to specify targets. You may already have this configuration file as it is used by many tools in the ecosystem, like [autoprefixer](https://github.com/postcss/autoprefixer), [stylelint](https://stylelint.io/), [eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat) and many others.

By default `@babel/preset-env` will use [browserslist config sources](https://github.com/ai/browserslist#queries) _unless_ either the [targets](#targets) or [ignoreBrowserslistConfig](#ignorebrowserslistconfig) options are set.

> Please note that if you are relying on browserslist's defaults query (either explicitly or by having no browserslist config), you will want to check out the [No targets](#no-targets) section for information on preset-env's behavior.

For example, to only include polyfills and code transforms needed for users whose browsers have >0.25% market share (ignoring browsers without security updates like IE 10 and BlackBerry):

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry"
      }
    ]
  ]
}
```

**browserslist**

```
> 0.25%
not dead
```

or

**package.json**

```
"browserslist": "> 0.25%, not dead"
```

> Please note that the browserslist query is resolved with [`mobileToDesktop: true`](https://github.com/browserslist/browserslist#js-api).
> For example, if you want to create a snapshot of a query run `npx browserslist --mobile-to-desktop ">0.25%, not dead"`.

## Options

For more information on setting options for a preset, refer to the [preset options](presets.md#preset-options) documentation.

### `targets`

`string | Array<string> | { [string]: string }`, defaults to `{}`.

Describes the environments you support/target for your project.

This can either be a [browserslist-compatible](https://github.com/ai/browserslist) query (with [caveats](#ineffective-browserslist-queries)):

```json
{
  "targets": "> 0.25%, not dead"
}
```

Or an object of minimum environment versions to support:

```json
{
  "targets": {
    "chrome": "58",
    "ie": "11"
  }
}
```

Example environments: `chrome`, `opera`, `edge`, `firefox`, `safari`, `ie`, `ios`, `android`, `node`, `electron`.

#### No targets

Since one of the original goals of `preset-env` was to help users easily transition from using `preset-latest`, it behaves similarly when no targets are specified: `preset-env` will transform all ES2015-ES2020 code to be ES5 compatible.

> We don't recommend using `preset-env` this way because it doesn't take advantage of its ability to target specific environments/versions.

```json
{
  "presets": ["@babel/preset-env"]
}
```

Because of this, `preset-env`'s behavior is different than [browserslist](https://github.com/browserslist/browserslist#queries): it does _not_ use the `defaults` query when there are no targets are found in your Babel _or_ browserslist config(s). If you want to use the `defaults` query, you will need to explicitly pass it as a target:

```json
{
  "presets": [["@babel/preset-env", { "targets": "defaults" }]]
}
```

We recognize this isn’t ideal and will be revisiting this in Babel v8.

#### `targets.esmodules`

`boolean`.

You may also target browsers supporting ES Modules (https://www.ecma-international.org/ecma-262/6.0/#sec-modules). When specifying this option, the browsers field will be ignored. You can use this approach in combination with `<script type="module"></script>` to conditionally serve smaller scripts to users (https://jakearchibald.com/2017/es-modules-in-browsers/#nomodule-for-backwards-compatibility).

> _Please note_: when specifying the esmodules target, browsers targets will be ignored.

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "esmodules": true
        }
      }
    ]
  ]
}
```

#### `targets.node`

`string | "current" | true`.

If you want to compile against the current node version, you can specify `"node": true` or `"node": "current"`, which would be the same as `"node": process.versions.node`.

#### `targets.safari`

`string | "tp"`.

If you want to compile against the [technology preview](https://developer.apple.com/safari/technology-preview/) version of Safari, you can specify `"safari": "tp"`.

#### `targets.browsers`

`string | Array<string>`.

A query to select browsers (ex: last 2 versions, > 5%, safari tp) using [browserslist](https://github.com/ai/browserslist).

Note, browsers' results are overridden by explicit items from `targets`.

> Note: this will be removed in later version in favor of just setting "targets" to a query directly.

### `bugfixes`

`boolean`, defaults to `false`.

> Note: These optimizations will be enabled by default in Babel 8

By default, `@babel/preset-env` (and Babel plugins in general) grouped ECMAScript syntax features into collections of closely related smaller features. These groups can be large and include a lot of edge cases, for example "function arguments" includes destructured, default and rest parameters. From this grouping information, Babel enables or disables each group based on the browser support target you specify to `@babel/preset-env`’s `targets` option.

When this option is enabled, `@babel/preset-env` tries to compile the broken syntax to the closest _non-broken modern syntax_ supported by your target browsers. Depending on your `targets` and on how many modern syntax you are using, this can lead to a significant size reduction in the compiled app. This option merges the features of [`@babel/preset-modules`](https://github.com/babel/preset-modules) without having to use another preset.

### `spec`

`boolean`, defaults to `false`.

Enable more spec compliant, but potentially slower, transformations for any plugins in this preset that support them.

### `loose`

`boolean`, defaults to `false`.

Enable ["loose" transformations](http://2ality.com/2015/12/babel6-loose-mode.html) for any plugins in this preset that allow them.

### `modules`

`"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false`, defaults to `"auto"`.

Enable transformation of ES module syntax to another module type. Note that `cjs` is just an alias for `commonjs`.

Setting this to `false` will preserve ES modules. Use this only if you intend to ship native ES Modules to browsers. If you are using a bundler with Babel, the default `modules: "auto"` is always preferred.

#### `modules: "auto"`
By default `@babel/preset-env` uses [`caller`](options.md#caller) data to determine whether ES modules and module features (e.g. `import()`) should be transformed. Generally `caller` data will be specified in the bundler plugins (e.g. `babel-loader`, `@rollup/plugin-babel`) and thus it is not recommended to pass `caller` data yourself -- The passed `caller` may overwrite the one from bundler plugins and in the future you may get suboptimal results if bundlers supports new module features.

### `debug`

`boolean`, defaults to `false`.

Outputs to `console.log` the polyfills and transform plugins enabled by `preset-env` and, if applicable, which one of your targets that needed it.

### `include`

`Array<string|RegExp>`, defaults to `[]`.

An array of plugins to always include.

Valid options include any:

- [Babel plugins](https://github.com/babel/babel/blob/master/packages/babel-compat-data/scripts/data/plugin-features.js) - without prefix: `transform-spread` and with prefixes [`@babel/`, `@babel/plugin-`, `babel-`, `babel-plugin-`]: [`@babel/transform-spread`, `@babel/plugin-transform-spread`, `babel-transform-spread`, `babel-plugin-transform-spread`] are supported.

- Built-ins (both for [core-js@2](https://github.com/babel/babel/blob/master/packages/babel-preset-env/src/polyfills/corejs2/built-in-definitions.js) and [core-js@3](https://github.com/babel/babel/blob/master/packages/babel-preset-env/src/polyfills/corejs3/built-in-definitions.js), such as `es.map`, `es.set`, or `es.object.assign`.

Plugin names can be fully or partially specified (or using `RegExp`).

Acceptable inputs:

- Full name (`string`): `"es.math.sign"`
- Partial name (`string`): `"es.math.*"` (resolves to all plugins with `es.math` prefix)
- `RegExp` Object: `/^transform-.*$/` or `new RegExp("^transform-modules-.*")`

Note that the above `.` is the `RegExp` equivalent to match any character, and not the actual `'.'` character. Also note that to match any character `.*` is used in `RegExp` as opposed to `*` in `glob` format.

This option is useful if there is a bug in a native implementation, or a combination of a non-supported feature + a supported one doesn't work.

For example, Node 4 supports native classes but not spread. If `super` is used with a spread argument, then the `@babel/plugin-transform-classes` transform needs to be `include`d, as it is not possible to transpile a spread with `super` otherwise.

> NOTE: The `include` and `exclude` options _only_ work with the [plugins included with this preset](https://github.com/babel/babel/blob/master/packages/babel-compat-data/scripts/data/plugin-features.js); so, for example, including `@babel/plugin-proposal-do-expressions` or excluding `@babel/plugin-proposal-function-bind` will throw errors. To use a plugin _not_ included with this preset, add them to your ["plugins"](options.md#plugins) directly.

### `exclude`

`Array<string|RegExp>`, defaults to `[]`.

An array of plugins to always exclude/remove.

The possible options are the same as the `include` option.

This option is useful for "blacklisting" a transform like `@babel/plugin-transform-regenerator` if you don't use generators and don't want to include `regeneratorRuntime` (when using `useBuiltIns`) or for using another plugin like [fast-async](https://github.com/MatAtBread/fast-async) instead of [Babel's async-to-gen](plugin-proposal-async-generator-functions.md).

### `useBuiltIns`

`"usage"` | `"entry"` | `false`, defaults to `false`.

This option configures how `@babel/preset-env` handles polyfills.

When either the `usage` or `entry` options are used, `@babel/preset-env` will add direct references to `core-js` modules as bare imports (or requires). This means `core-js` will be resolved relative to the file itself and needs to be accessible.

Since `@babel/polyfill` was deprecated in 7.4.0, we recommend directly adding `core-js` and setting the version via the [`corejs`](#corejs) option.

```sh
npm install core-js@3 --save

# or

npm install core-js@2 --save
```

#### `useBuiltIns: 'entry'`

> NOTE: Only use `import "core-js";` and `import "regenerator-runtime/runtime";` once in your whole app.
> If you are using `@babel/polyfill`, it already includes both `core-js` and `regenerator-runtime`: importing it twice will throw an error.
> Multiple imports or requires of those packages might cause global collisions and other issues that are hard to trace.
> We recommend creating a single entry file that only contains the `import` statements.

This option enables a new plugin that replaces the `import "core-js/stable";` and `import "regenerator-runtime/runtime"` statements (or `require("core-js")` and `require("regenerator-runtime/runtime")`) with individual requires to different `core-js` entry points based on environment.

**In**

```js
import "core-js";
```

**Out (different based on environment)**

```js
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.string.pad-end";
```

Importing `"core-js"` loads polyfills for every possible ECMAScript feature: what if you know that you only need some of them? When using `core-js@3`, `@babel/preset-env` is able to optimize every single `core-js` entrypoint and their combinations. For example, you might want to only polyfill array methods and new `Math` proposals:

**In**

```js
import "core-js/es/array";
import "core-js/proposals/math-extensions";
```

**Out (different based on environment)**

```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/esnext.math.clamp";
import "core-js/modules/esnext.math.deg-per-rad";
import "core-js/modules/esnext.math.degrees";
import "core-js/modules/esnext.math.fscale";
import "core-js/modules/esnext.math.rad-per-deg";
import "core-js/modules/esnext.math.radians";
import "core-js/modules/esnext.math.scale";
```

You can read [core-js](https://github.com/zloirock/core-js)'s documentation for more information about the different entry points.

> NOTE: When using `core-js@2` (either explicitly using the [`corejs: 2`](#corejs) option or implicitly), `@babel/preset-env` will also imports and requires of `@babel/polyfill`.
> This behavior is deprecated because it isn't possible to use `@babel/polyfill` with different `core-js` versions.

#### `useBuiltIns: 'usage'`

Adds specific imports for polyfills when they are used in each file. We take advantage of the fact that a bundler will load the same polyfill only once.

**In**

a.js

```js
var a = new Promise();
```

b.js

```js
var b = new Map();
```

**Out (if environment doesn't support it)**

a.js

```js
import "core-js/modules/es.promise";
var a = new Promise();
```

b.js

```js
import "core-js/modules/es.map";
var b = new Map();
```

**Out (if environment supports it)**

a.js

```js
var a = new Promise();
```

b.js

```js
var b = new Map();
```

#### `useBuiltIns: false`

Don't add polyfills automatically per file, and don't transform `import "core-js"` or `import "@babel/polyfill"` to individual polyfills.

### `corejs`

`2`, `3` or `{ version: 2 | 3, proposals: boolean }`, defaults to `2`.

This option only has an effect when used alongside `useBuiltIns: usage` or `useBuiltIns: entry`, and ensures `@babel/preset-env` injects the correct imports for your `core-js` version.

By default, only polyfills for stable ECMAScript features are injected: if you want to polyfill them, you have three different options:

- when using `useBuiltIns: "entry"`, you can directly import a [proposal polyfill](https://github.com/zloirock/core-js/tree/master/packages/core-js/proposals): `import "core-js/proposals/string-replace-all"`.
- when using `useBuiltIns: "usage"` you have two different alternatives:
  - set the [`shippedProposals`](#shippedproposals) option to `true`. This will enable polyfills and transforms for proposal which have already been shipped in browsers for a while.
  - use `corejs: { version: 3, proposals: true }`. This will enable polyfilling of every proposal supported by `core-js`.

### `forceAllTransforms`

`boolean`, defaults to `false`.

<p><details>
  <summary><b>Example</b></summary>

With Babel 7's [JavaScript config file](config-files#javascript) support, you can force all transforms to be run if env is set to `production`.

```js
module.exports = function(api) {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            chrome: 59,
            edge: 13,
            firefox: 50,
          },
          // for uglifyjs...
          forceAllTransforms: api.env("production"),
        },
      ],
    ],
  };
};
```

</details></p>

> NOTE: `targets.uglify` is deprecated and will be removed in the next major in
> favor of this.

By default, this preset will run all the transforms needed for the targeted
environment(s). Enable this option if you want to force running _all_
transforms, which is useful if the output will be run through UglifyJS or an
environment that only supports ES5.

> NOTE: Uglify has a work-in-progress "Harmony" branch to address the lack of
> ES6 support, but it is not yet stable. You can follow its progress in
> [UglifyJS2 issue #448](https://github.com/mishoo/UglifyJS2/issues/448). If you
> require an alternative minifier which _does_ support ES6 syntax, we recommend
> using [babel-minify](preset-minify.md).

### `configPath`

`string`, defaults to `process.cwd()`

The starting point where the config search for browserslist will start, and ascend to the system root until found.

### `ignoreBrowserslistConfig`

`boolean`, defaults to `false`

Toggles whether or not [browserslist config sources](https://github.com/ai/browserslist#queries) are used, which includes searching for any browserslist files or referencing the browserslist key inside package.json. This is useful for projects that use a browserslist config for files that won't be compiled with Babel.

### `browserslistEnv`

`string`, defaults to `undefined`

The [Browserslist environment](https://github.com/browserslist/browserslist#configuring-for-different-environments) to use.

### `shippedProposals`

`boolean`, defaults to `false`

Toggles enabling support for builtin/feature proposals that have shipped in browsers. If your target environments have native support for a feature proposal, its matching parser syntax plugin is enabled instead of performing any transform. Note that this _does not_ enable the same transformations as [`@babel/preset-stage-3`](preset-stage-3.md), since proposals can continue to change before landing in browsers.

The following are currently supported:

**Builtins** injected when using `useBuiltIns: "usage"`

- [esnext.global-this](https://github.com/tc39/proposal-global) (only supported by `core-js@3`)
- [esnext.string.match-all](https://github.com/tc39/proposal-string-matchall) (only supported by `core-js@3`)

**Features**

- [class properties](https://github.com/tc39/proposal-class-fields)
- [numeric separator](https://github.com/tc39/proposal-numeric-separator)
- [private methods](https://github.com/tc39/proposal-private-methods)

> You can read more about configuring preset options [here](https://babeljs.io/docs/en/presets#preset-options)

## Caveats

### Ineffective browserslist queries

While `op_mini all` is a valid browserslist query, preset-env currently ignores it due to [lack of support data](https://github.com/kangax/compat-table/issues/1057) for Opera Mini.
