---
title: Options
id: options
sidebar_label: Config Options
---

- [Primary options](#primary-options)
- [Config Loading options](#config-loading-options)
- [Plugin and Preset configuration](#plugin-and-preset-options)
- [Config Merging options](#config-merging-options)
- [Source Map options](#source-map-options)
- [Misc options](#misc-options)
- [Code Generator options](#code-generator-options)
- [AMD / UMD / SystemJS options](#amd--umd--systemjs-module-options)
- [Option concepts](#options-concepts)

Options can be passed to Babel in a variety of ways. When passed directly to Babel,
you can just pass the objects object. When Babel is used via a wrapper, it may also be
necessary, or at least more useful, to pass the options via [configuration files](config-files.md).

If passing options via `@babel/cli` you'll need to `kebab-case` the names. i.e.

```
npx babel --root-mode upward file.js # equivalent of passing the rootMode config option
```

## Primary options

These options are only allowed as part of Babel's programmatic options, so
they are primarily for use by tools that wrap around Babel, or people calling
`babel.transform` directly. Users of Babel's integrations, like `babel-loader`
or [`@babel/register`](core.md#options) are unlikely to use these.

### `cwd`

Type: `string`<br />
Default: `process.cwd()`<br />

The working directory that all paths in the programmatic options will be resolved
relative to.

### `caller`

Type: An object with the shape of

```flow
interface CallerData {
  name: string;
  supportsStaticESM?: boolean;
  supportsDynamicImport?: boolean;
  supportsTopLevelAwait?: boolean;
  supportsExportNamespaceFrom?: boolean;
}
```

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| v7.11.0 | Add `supportsExportNamespaceFrom` |
| v7.7.0 | Add `supportsTopLevelAwait` |
| v7.5.0 | Add `supportsDynamicImport` |
</details>

Utilities may pass a `caller` object to identify themselves to Babel and pass
capability-related flags for use by configs, presets and plugins. For example

```js
babel.transformFileSync("example.js", {
  caller: {
    name: "my-custom-tool",
    supportsStaticESM: true,
  },
});
```

would allow plugins and presets to decide that, since ES modules are supported,
they will skip compilation of ES modules into CommonJS modules.

### `filename`

Type: `string`<br />

The filename associated with the code currently being compiled, if there is one.
The filename is optional, but not all of Babel's functionality is available when
the filename is unknown, because a subset of options rely on the filename
for their functionality.

The three primary cases users could run into are:

- The filename is exposed to plugins. Some plugins may require the presence of the filename.
- Options like [`"test"`](#test), [`"exclude"`](#exclude), and [`"ignore"`](#ignore) require the filename for string/RegExp matching.
- `.babelrc.json` or `.babelrc` files are loaded relative to the file being compiled. If this option is omitted, Babel will behave as if `babelrc: false` has been set.

### `filenameRelative`

Type: `string`<br />
Default: `path.relative(opts.cwd, opts.filename)` (if [`"filename"`](#filename) was passed)<br />

Used as the default value for Babel's `sourceFileName` option, and used
as part of generation of filenames for the AMD / UMD / SystemJS module transforms.

### `code`

Type: `boolean`<br />
Default: `true`<br />

Babel's default return value includes `code` and `map` properties with the
resulting generated code. In some contexts where multiple calls to Babel
are being made, it can be helpful to disable code generation and instead
use `ast: true` to get the AST directly in order to avoid doing unnecessary work.

### `ast`

Type: `boolean`<br />
Default: `false`<br />

Babel's default is to generate a string and a sourcemap, but in some
contexts it can be useful to get the AST itself. The primary use case for this
would be a chain of multiple transform passes, along the lines of

```js
const filename = "example.js";
const source = fs.readFileSync(filename, "utf8");

// Load and compile file normally, but skip code generation.
const { ast } = babel.transformSync(source, {
  filename,
  ast: true,
  code: false,
});

// Minify the file in a second pass and generate the output code here.
const { code, map } = babel.transformFromAstSync(ast, source, {
  filename,
  presets: ["minify"],
  babelrc: false,
  configFile: false,
});
```

Note: This option is not on by default because the majority of users won't need
it and because we'd like to eventually add a caching layer to Babel. Having
to cache the AST structure will take significantly more space.

### `cloneInputAst`

Type: `boolean`<br />
Default: `true`<br />
Added in `v7.11.0`

By default `babel.transformFromAst` will clone the input AST to avoid mutations.
Specifying `cloneInputAst: false` can improve parsing performance if the input AST
is not used elsewhere.

## Config Loading options

Loading configuration can get a little complex as environments can have several
types of configuration files, and those configuration files can have various
nested configuration objects that apply depending on the configuration.

### `root`

Type: `string`<br />
Default: `opts.cwd`<br />
Placement: Only allowed in Babel's programmatic options<br />

The initial path that will be processed based on the [`"rootMode"`](#rootmode)
to determine the conceptual root folder for the current Babel project.
This is used in two primary cases:

- The base directory when checking for the default [`"configFile"`](#configfile) value
- The default value for [`"babelrcRoots"`](#babelrcroots).

### `rootMode`

Type: `"root" | "upward" | "upward-optional"`<br />
Default: `"root"`<br />
Placement: Only allowed in Babel's programmatic options<br />
Added in: `v7.1.0`

This option, combined with the [`"root"`](#root) value, defines how Babel
chooses its project root. The different modes define different ways that
Babel can process the [`"root"`](#root) value to get the final project root.

Note: `babel.config.json` is supported from Babel 7.8.0. In older Babel 7 versions, only `babel.config.js` is supported.

- `"root"` - Passes the [`"root"`](#root) value through as unchanged.
- `"upward"` - Walks upward from the [`"root"`](#root) directory, looking
  for a directory containing a [`babel.config.json`](config-files.md#project-wide-configuration)
  file, and throws an error if a [`babel.config.json`](config-files.md#project-wide-configuration)
  is not found.
- `"upward-optional"` - Walk upward from the [`"root"`](#root) directory,
  looking for a directory containing a [`babel.config.json`](config-files.md#project-wide-configuration)
  file, and falls back to [`"root"`](#root) if a [`babel.config.json`](config-files.md#project-wide-configuration)
  is not found.

`"root"` is the default mode because it avoids the risk that Babel will
accidentally load a `babel.config.json` that is entirely outside of the current
project folder. If you use `"upward-optional"`, be aware that it will walk up the
directory structure all the way to the filesystem root, and it is always
possible that someone will have a forgotten `babel.config.json` in their home
directory, which could cause unexpected errors in your builds.

Users with monorepo project structures that run builds/tests on a per-package basis
may well want to use `"upward"` since monorepos often have a [`babel.config.json`](config-files.md#project-wide-configuration)
in the project root. Running Babel in a monorepo subdirectory without `"upward"`,
will cause Babel to skip loading any [`babel.config.json`](config-files.md#project-wide-configuration)
files in the project root, which can lead to unexpected errors and compilation failure.

### `envName`

Type: `string`<br />
Default: `process.env.BABEL_ENV || process.env.NODE_ENV || "development"`<br />
Placement: Only allowed in Babel's programmatic options<br />

The current active environment used during configuration loading. This value
is used as the key when resolving [`"env"`](#env) configs, and is also
available inside configuration functions, plugins, and presets, via the
[`api.env()`](config-files.md#apienv) function.

### `configFile`

Type: `string | boolean`<br />
Default: `path.resolve(opts.root, "babel.config.json")`, if it exists, `false` otherwise<br />
Placement: Only allowed in Babel's programmatic options<br />

Defaults to searching for a default `babel.config.json` file, but can be passed
the path of any JS or JSON5 config file.

NOTE: This option does _not_ affect loading of [`.babelrc.json`](config-files.md#file-relative-configuration) files, so while
it may be tempting to do `configFile: "./foo/.babelrc.json"`, it is not recommended.
If the given [`.babelrc.json`](config-files.md#file-relative-configuration) is loaded via the standard
file-relative logic, you'll end up loading the same config file twice, merging it with itself.
If you are linking a specific config file, it is recommended to stick with a
naming scheme that is independent of the "babelrc" name.

### `babelrc`

Type: `boolean`<br />
Default: `true` as long as the `filename` option has been specified<br />
Placement: Allowed in Babel's programmatic options, or inside of the loaded [`"configFile"`](#configfile). A programmatic option will override a config file one.<br />

`true` will enable searching for [configuration files](config-files.md#file-relative-configuration) relative
to the [`"filename"`](#filename) provided to Babel.

A `babelrc` value passed in the programmatic options will override one set
within a configuration file.

Note: `.babelrc.json` files are only loaded if the current [`"filename"`](#filename) is inside of
a package that matches one of the [`"babelrcRoots"`](#babelrcroots) packages.

### `babelrcRoots`

Type: `boolean | MatchPattern | Array<MatchPattern>`<br />
Default: `opts.root`<br />
Placement: Allowed in Babel's programmatic options, or inside of the loaded `configFile`. A programmatic option will override a config file one.<br />

By default, Babel will only search for `.babelrc.json` files within the [`"root"`](#root) package
because otherwise Babel cannot know if a given `.babelrc.json` is meant to be loaded, or
if it's [`"plugins"`](#plugins) and [`"presets"`](#presets) have even been installed, since the file being
compiled could be inside `node_modules`, or have been symlinked into the project.

This option allows users to provide a list of other packages that should be considered
"root" packages when considering whether to load `.babelrc.json` files.

For example, a monorepo setup that wishes to allow individual packages to
have their own configs might want to do

```js
babelrcRoots: [
  // Keep the root as a root
  ".",

  // Also consider monorepo packages "root" and load their .babelrc.json files.
  "./packages/*",
];
```

## Plugin and Preset options

### `plugins`

Type: `Array<PluginEntry | Plugin>` ([`PluginEntry`](#plugin-preset-entries))<br />
Default: `[]`<br />

An array of plugins to activate when processing this file. For more information on how
individual entries interact, especially when used across multiple nested [`"env"`](#env) and
[`"overrides"`](#overrides) configs, see [merging](#merging).

Note: The option also allows `Plugin` instances from Babel itself, but
using these directly is not recommended. If you need to create a persistent
representation of a plugin or preset, you should use [`babel.createConfigItem()`](core.md#createconfigitem).

### `presets`

Type: `Array<PresetEntry>` ([`PresetEntry`](#plugin-preset-entries))<br />
Default: `[]`<br />

An array of presets to activate when processing this file. For more information on how
individual entries interact, especially when used across multiple nested [`"env"`](#env) and
[`"overrides"`](#overrides) configs, see [merging](#merging).

Note: The format of presets is identical to plugins, except for the fact that
name normalization expects "preset-" instead of "plugin-", and presets cannot
be instances of `Plugin`.

### `passPerPreset`

Type: `boolean`<br />
Default: `false`<br />
Status: _Deprecated_<br />

Instructs Babel to run each of the presets in the `presets` array as an
independent pass. This option tends to introduce a lot of confusion around
the exact ordering of plugins, but can be useful if you absolutely need to run
a set of operations as independent compilation passes.

Note: This option may be removed in future Babel versions as we add better
support for defining ordering between plugins.

## Output targets

### `targets`

Type: `string | Array<string> | { [string]: string }`<br />
Default: `{}`<br />
Placement: Allowed in Babel's programmatic options, or in config files<br />
Added in: `v7.13.0`<br />

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

When no targets are specified: Babel will assume you are targeting the oldest browsers possible. For example, `@babel/preset-env` will transform all ES2015-ES2020 code to be ES5 compatible.

> We recommend setting `targets` to reduce the output code size.

```json
{
  "presets": ["@babel/preset-env"]
}
```

Because of this, Babel's behavior is different than [browserslist](https://github.com/browserslist/browserslist#queries): it does _not_ use the `defaults` query when there are no targets are found in your Babel _or_ browserslist config(s). If you want to use the `defaults` query, you will need to explicitly pass it as a target:

```json
{
  "targets": "defaults"
}
```

We recognize this isn’t ideal and will be revisiting this in Babel v8.

#### `targets.esmodules`

Type: `boolean`

You may also target browsers supporting ES Modules (https://www.ecma-international.org/ecma-262/6.0/#sec-modules). When the `esmodules` target is specified, it will intersect with the `browsers` target and `browserslist`'s targets. You can use this approach in combination with `<script type="module"></script>` to conditionally serve smaller scripts to users (https://jakearchibald.com/2017/es-modules-in-browsers/#nomodule-for-backwards-compatibility).

```json
{
  "targets": {
    "esmodules": true
  }
}
```

#### `targets.node`

Type: `string | "current" | true`.

If you want to compile against the current node version, you can specify `"node": true` or `"node": "current"`, which would be the same as `"node": process.versions.node`.

#### `targets.safari`

Type: `string | "tp"`.

If you want to compile against the [technology preview](https://developer.apple.com/safari/technology-preview/) version of Safari, you can specify `"safari": "tp"`.

#### `targets.browsers`

Type: `string | Array<string>`.

A query to select browsers (ex: last 2 versions, > 5%, safari tp) using [browserslist](https://github.com/ai/browserslist).

Note, browsers' results are overridden by explicit items from `targets`.

### `browserslistConfigFile`

Type: `boolean`<br />
Default: `true`<br />
Placement: Allowed in Babel's programmatic options, or in config files<br />
Added in: `v7.13.0`<br />

Toggles whether or not [browserslist config sources](https://github.com/ai/browserslist#queries) are used, which includes searching for any browserslist files or referencing the browserslist key inside package.json. This is useful for projects that use a browserslist config for files that won't be compiled with Babel.

If a string is specified, it must represent the path of a browserslist configuration file. Relative paths are resolved relative to the configuration file which specifies this option, or to `cwd` when it's passed as part of the programmatic options.

### `browserslistEnv`

Type: `string`<br />
Default: `undefined`<br />
Placement: Allowed in Babel's programmatic options, or in config files<br />
Added in: `v7.13.0`<br />

The [Browserslist environment](https://github.com/browserslist/browserslist#configuring-for-different-environments) to use.

## Config Merging options

### `extends`

Type: `string`<br />
Placement: Not allowed inside of presets<br />

Configs may "extend" other configuration files. Config fields in the current
config will be [merged](#merging) on top of the extended file's configuration.

### `env`

Type: `{ [envKey: string]: Options }`<br />
Placement: May not be nested inside of another `env` block.<br />

Allows for entire nested configuration options that will only be enabled
if the `envKey` matches the `envName` option.

Note: `env[envKey]` options will be [merged](#merging) on top of the options specified in
the root object.

### `overrides`

Type: `Array<Options>`<br />
Placement: May not be nested inside of another `overrides` object, or within an `env` block.<br />

Allows users to provide an array of options that will be [merged](#merging) into the current
configuration one at a time. This feature is best used alongside the [`"test"`](#test)/[`"include"`](#include)/[`"exclude"`](#exclude)
options to provide conditions for which an override should apply. For example:

```js
overrides: [{
  test: "./vendor/large.min.js",
  compact: true,
}],
```

could be used to enable the `compact` option for one specific file that is known
to be large and minified, and tell Babel not to bother trying to print the file nicely.

### `test`

Type: `MatchPattern | Array<MatchPattern>` ([`MatchPattern`](#matchpattern))<br />

If all patterns fail to match, the current configuration object is considered
inactive and is ignored during config processing. This option is most useful
when used within an `overrides` option object, but it's allowed anywhere.

Note: These toggles do not affect the programmatic and config-loading options
in earlier sections, since they are taken into account long before the
configuration that is prepared for merging.

### `include`

Type: `MatchPattern | Array<MatchPattern>` ([`MatchPattern`](#matchpattern))<br />

This option is a synonym for [`"test"`](#test).

### `exclude`

Type: `MatchPattern | Array<MatchPattern>` ([`MatchPattern`](#matchpattern))<br />

If any of patterns match, the current configuration object is considered
inactive and is ignored during config processing. This option is most useful
when used within an `overrides` option object, but it's allowed anywhere.

Note: These toggles do not affect the programmatic and config-loading options
in earlier sections, since they are taken into account long before the
configuration that is prepared for merging.

### `ignore`

Type: `Array<MatchPattern>` ([`MatchPattern`](#matchpattern))<br />
Placement: Not allowed inside of presets<br />

If any of the patterns match, Babel will immediately stop all processing of
the current build. For example, a user may want to do something like

```js
ignore: ["./lib"];
```

to explicitly disable Babel compilation of files inside the `lib` directory.

Note: This option disables _all_ Babel processing of a file. While that has
its uses, it is also worth considering the [`"exclude"`](#exclude) option as a less aggressive
alternative.

### `only`

Type: `Array<MatchPattern>` ([`MatchPattern`](#matchpattern))<br />
Placement: Not allowed inside of presets<br />

If all of the patterns fail to match, Babel will immediately stop all processing
of the current build. For example, a user may want to do something like

```js
only: ["./src"];
```

to explicitly enable Babel compilation of files inside the `src` directory
while disabling everything else.

Note: This option disables _all_ Babel processing of a file. While that has
its uses, it is also worth considering the [`"test"`](#test)/[`"include"`](#include)
options as a less aggressive alternative.

## Source Map options

### `inputSourceMap`

Type: `boolean | SourceMap`<br />
Default: `true`<br />

`true` will attempt to load an input sourcemap from the file itself, if it
contains a `//# sourceMappingURL=...` comment. If no map is found, or the
map fails to load and parse, it will be silently discarded.

If an object is provided, it will be treated as the source map object itself.

### `sourceMaps`

Type: `boolean | "inline" | "both"`<br />
Default: `false`<br />

- `true` to generate a sourcemap for the code and include it in the result object.
- `"inline"` to generate a sourcemap and append it as a data URL to the end of the code, but not include it in the result object.
- `"both"` is the same as inline, but will include the map in the result object.

`@babel/cli` overloads some of these to also affect how maps are written to disk:

- `true` will write the map to a `.map` file on disk
- `"inline"` will write the file directly, so it will have a `data:` containing the map
- `"both"` will write the file with a `data:` URL and _also_ a `.map`.

Note: These options are bit weird, so it may make the most sense to just use
`true` and handle the rest in your own code, depending on your use case.

### `sourceMap`

This is an synonym for `sourceMaps`. Using `sourceMaps` is recommended.

### `sourceFileName`

Type: `string`<br />
Default: `path.basename(opts.filenameRelative)` when available, or `"unknown"`<br />

The name to use for the file inside the source map object.

### `sourceRoot`

Type: `string`<br />

The `sourceRoot` fields to set in the generated source map, if one is desired.

## Misc options

### `sourceType`

Type: `"script" | "module" | "unambiguous"`<br />
Default: "module"<br />

- `"script"` - Parse the file using the ECMAScript Script grammar. No `import`/`export` statements allowed, and files are not in strict mode.
- `"module"` - Parse the file using the ECMAScript Module grammar. Files are automatically strict, and `import`/`export` statements are allowed.
- `"unambiguous"` - Consider the file a "module" if `import`/`export` statements are present, or else consider it a "script".

`unambiguous` can be quite useful in contexts where the type is unknown, but it can lead to
false matches because it's perfectly valid to have a module file that does not use `import`/`export`
statements.

This option is important because the type of the current file affects both
parsing of input files, and certain transforms that may wish to add
`import`/`require` usage to the current file.

For instance, [`@babel/plugin-transform-runtime`](plugin-transform-runtime.md)
relies on the type of the current document to decide whether to insert
an `import` declaration, or a `require()` call.
[`@babel/preset-env`](preset-env.md) also does the same for its
[`"useBuiltIns"`](preset-env.md#usebuiltins) option. Since Babel defaults to treating files
are ES modules, generally these plugins/presets will insert `import` statements. Setting
the correct `sourceType` can be important because having the wrong type can lead to cases
where Babel would insert `import` statements into files that are meant to be CommonJS
files. This can be particularly important in projects where compilation
of `node_modules` dependencies is being performed, because inserting an
`import` statements can cause Webpack and other tooling to see a file
as an ES module, breaking what would otherwise be a functional CommonJS file.

Note: This option will not affect parsing of `.mjs` files, as they are currently
hard-coded to always parse as `"module"` files.

### `assumptions`

Type: `{ [assumption: string]: boolean }`<br />
Default: `{}`<br />
Placement: Allowed in programmatic options, config files and presets.<br />

Set assumptions that Babel can make in order to produce smaller output:

```json
{
  "assumptions": {
    "iterableIsArray": true
  },
  "presets": ["@babel/preset-env"]
}
```

For more informations, check the [assumptions](/assumptions) documentation page.

### `highlightCode`

Type: `boolean`<br />
Default: `true`<br />

Highlight tokens in code snippets in Babel's error messages to make them easier to read.

### `wrapPluginVisitorMethod`

Type: `(key: string, nodeType: string, fn: Function) => Function`<br />

Allows users to add a wrapper on each visitor in order to inspect the visitor
process as Babel executes the plugins.

- `key` is a simple opaque string that represents the plugin being executed.
- `nodeType` is the type of AST node currently being visited.
- `fn` is the visitor function itself.

Users can return a replacement function that should call the original function
after performing whatever logging and analysis they wish to do.

### `parserOpts`

Type: `{}`<br />

An opaque object containing options to pass through to the parser being used.

For available parser options, see [Parser Options](parser.md#options).

### `generatorOpts`

Type: `{}`<br />

An opaque object containing options to pass through to the code generator being used. See [Code Generator Options](#code-generator-options) for most used options.

## Code Generator options

### `retainLines`

Type: `boolean`<br />
Default: `false`<br />

Babel will make an effort to generate code such that items are printed on the
same line that they were on in the original file. This option exists so that
users who cannot use source maps can get vaguely useful error line numbers,
but it is only a best-effort, and is not guaranteed in all cases with all plugins.

### `compact`

Type: `boolean | "auto"`<br />
Default: `"auto"`<br />

"auto" will set the value by evaluating `code.length > 500_000`

All optional newlines and whitespace will be omitted when generating code in
compact mode.

### `minified`

Type: `boolean`<br />
Default: `false`<br />

Includes `compact: true`, omits block-end semicolons, omits `()` from
`new Foo()` when possible, and may output shorter versions of literals.

### `auxiliaryCommentBefore`

Type: `string`<br />

Allows specifying a prefix comment to insert before pieces of code that were
not present in the original file.

Note: The definition of what is and isn't present in the original file can
get a little ugly, so usage of this option is _not recommended_. If you need to
annotate code somehow, it is better to do so using a Babel plugin.

### `auxiliaryCommentAfter`

Type: `string`<br />

Allows specifying a prefix comment to insert after pieces of code that were
not present in the original file.

Note: The definition of what is and isn't present in the original file can
get a little ugly, so usage of this option is _not recommended_. If you need to
annotate code somehow, it is better to do so using a Babel plugin.

### `comments`

Type: `boolean`<br />
Default: `true`<br />

Provides a default comment state for `shouldPrintComment` if no function
is given. See the default value of that option for more info.

### `shouldPrintComment`

Type: `(value: string) => boolean`<br />
Default without `minified`: `(val) => opts.comments || /@license|@preserve/.test(val)`<br />
Default with `minified`: `() => opts.comments`<br />

A function that can decide whether a given comment should be included in the
output code from Babel.

### Advanced Usage

For more code generator options, see [Generator Options](generator.md#options).

## AMD / UMD / SystemJS module options

### `moduleIds`

Type: `boolean`<br />
Default: `!!opts.moduleId`<br />

Enables module ID generation.

### `moduleId`

Type: `string`<br />

A hard-coded ID to use for the module. Cannot be used alongside `getModuleId`.

### `getModuleId`

Type: `(name: string) => string`<br />

Given the babel-generated module name, return the name to use. Returning
a falsy value will use the original `name`.

### `moduleRoot`

Type: `string`<br />

A root path to include on generated module names.

## Options Concepts

### `MatchPattern`

Type: `string | RegExp | (filename: string | void, context: { caller: { name: string } | void, envName: string, dirname: string ) => boolean`

Several Babel options perform tests against file paths. In general, these
options support a common pattern approach where each pattern can be

- `string` - A file path with simple support for `*` and `**` as full slug matches. Any file or
  parent folder matching the pattern counts as a match. The path follow's Node's normal path logic,
  so on POSIX is must be `/`-separated, but on Windows both `/` and `\` are supported.
- `RegExp` - A regular expression to match against the normalized filename. On POSIX the path
  RegExp will run against a `/`-separated path, and on Windows it will be on a `\`-separated path.

Importantly, if either of these are used, Babel requires that the `filename` option be present,
and will consider it an error otherwise.

- `(filename: string | void, context: { caller: { name: string } | void, envName: string, dirname: string }) => boolean` is a general callback that should
  return a boolean to indicate whether it is a match or not. The function is passed the filename
  or `undefined` if one was not given to Babel. It is also passed the current `envName` and `caller`
  options that were specified by the top-level call to Babel and `dirname` that is either a directory of the configuration file or the current working directory (if the transformation was called programmatically).

### Merging

Babel's configuration merging is relatively straightforward. Options will overwrite existing options
when they are present, and their value is not `undefined`, with a few special cases:

- `parserOpts` objects are merged, rather than replaced, using the same logic as top-level options.
- `generatorOpts` objects are merged, rather than replaced, using the same logic as top-level options.
- `plugins` and `presets` are replaced based on the identity of the plugin/preset object/function itself combined with the name of the entry.

#### Plugin/Preset merging

As an example, consider a config with:

```js
plugins: [
  './other',
  ['./plug', { thing: true, field1: true }]
],
overrides: [{
  plugins: [
    ['./plug', { thing: false, field2: true }],
  ]
}]
```

The `overrides` item will be merged on top of the top-level plugins. Importantly, the `plugins`
array as a whole doesn't just replace the top-level one. The merging logic will see that `"./plug"`
is the same plugin in both cases, and `{ thing: false, field2: true }` will replace the original
options, resulting in a config as

```js
plugins: [
  './other',
  ['./plug', { thing: false, field2: true }],
],
```

Since merging is based on identity + name, it is considered an error to use the same plugin with
the same name twice in the same `plugins`/`presets` array. For example

```js
plugins: ["./plug", "./plug"];
```

is considered an error, because it's identical to `plugins: ['./plug']`. Additionally, even

```js
plugins: [["./plug", { one: true }], ["./plug", { two: true }]];
```

is considered an error, because the second one would just always replace the first one.

If you actually _do_ want to instantiate two separate instances of a plugin, you must assign each one
a name to disambiguate them. For example:

```js
plugins: [
  ["./plug", { one: true }, "first-instance-name"],
  ["./plug", { two: true }, "second-instance-name"],
];
```

because each instance has been given a unique name and this a unique identity.

### Plugin/Preset entries

#### `PluginEntry` / `PresetEntry`

Individual plugin/preset items can have several different structures:

- `EntryTarget` - Individual plugin
- `[EntryTarget, EntryOptions]` - Individual plugin w/ options
- `[EntryTarget, EntryOptions, string]` - Individual plugin with options and name (see [merging](#merging) for more info on names)
- `ConfigItem` - A plugin configuration item created by `babel.createConfigItem()`.

The same `EntryTarget` may be used multiple times unless each one is given a different
name, and doing so will result in a duplicate-plugin/preset error.

That can be a little hard to read, so as an example:

```js
plugins: [
  // EntryTarget
  '@babel/plugin-transform-classes',

  // [EntryTarget, EntryOptions]
  ['@babel/plugin-transform-arrow-functions', { spec: true }],

  // [EntryTarget, EntryOptions, string]
  ['@babel/plugin-transform-for-of', { loose: true }, "some-name"],

  // ConfigItem
  babel.createConfigItem(require("@babel/plugin-transform-spread")),
],
```

#### `EntryTarget`

Type: `string | {} | Function`<br />

A plugin/preset target can come from a few different sources:

- `string` - A `require`-style path or plugin/preset identifier. Identifiers will be passed through [name normalization](#name-normalization).
- `{} | Function` - An actual plugin/preset object or function after it has been `require()`ed.

#### `EntryOptions`

Type: `undefined | {} | false`

Options are passed through to each plugin/preset when they are executed. `undefined` will be
normalized to an empty object.

`false` indicates that an entry is entirely disabled. This can be useful in contexts where ordering
is important, but a separate condition is needed to decide if something is enabled. For instance:

```js
plugins: [
  'one',
  ['two', false],
  'three',
],
overrides: [{
  test: "./src",
  plugins: [
    'two',
  ]
}]
```

would enable the `two` plugin for files in `src`, but `two` would still execute between `one` and `three`.

### Name Normalization

By default, Babel expects plugins to have a `babel-plugin-` or `babel-preset-` prefix in their name.
To avoid repetition, Babel has a name normalization phase will automatically add these prefixes
when loading items. This boils down to a few primary rules:

- Absolute paths pass through untouched.
- Relative paths starting with `./` pass through untouched.
- References to files _within_ a package are untouched.
- Any identifier prefixed with `module:` will have the prefix removed but otherwise be untouched.
- `plugin-`/`preset-` will be injected at the start of any `@babel`-scoped package that doesn't have it as a prefix.
- `babel-plugin-`/`babel-preset-` will be injected as a prefix any unscoped package that doesn't have it as a prefix.
- `babel-plugin-`/`babel-preset-` will be injected as a prefix any `@`-scoped package that doesn't have it _anywhere_ in their name.
- `babel-plugin`/`babel-preset` will be injected as the package name if only the `@`-scope name is given.

Here are some examples, when applied in a plugin context:

| Input                              | Normalized                         |
| ---------------------------------- | ---------------------------------- |
| `"/dir/plugin.js"`                 | `"/dir/plugin.js"`                 |
| `"./dir/plugin.js"`                | `"./dir/plugin.js"`                |
| `"mod"`                            | `"babel-plugin-mod"`               |
| `"mod/plugin"`                     | `"mod/plugin"`                     |
| `"babel-plugin-mod"`               | `"babel-plugin-mod"`               |
| `"@babel/mod"`                     | `"@babel/plugin-mod"`              |
| `"@babel/plugin-mod"`              | `"@babel/plugin-mod"`              |
| `"@babel/mod/plugin"`              | `"@babel/mod/plugin"`              |
| `"@scope"`                         | `"@scope/babel-plugin"`            |
| `"@scope/babel-plugin"`            | `"@scope/babel-plugin"`            |
| `"@scope/mod"`                     | `"@scope/babel-plugin-mod"`        |
| `"@scope/babel-plugin-mod"`        | `"@scope/babel-plugin-mod"`        |
| `"@scope/prefix-babel-plugin-mod"` | `"@scope/prefix-babel-plugin-mod"` |
| `"@scope/mod/plugin"`              | `"@scope/mod/plugin"`              |
| `"module:foo"`                     | `"foo"`                            |
