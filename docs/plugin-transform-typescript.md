---
id: babel-plugin-transform-typescript
title: @babel/plugin-transform-typescript
sidebar_label: Typescript Plugin
---

> **NOTE**: This plugin is included in `@babel/preset-typescript`

This plugin adds support for the types syntax used by the [TypeScript programming language][ts]. However, this plugin does not add the ability to type-check the JavaScript passed to it. For that, you will need to install and set up TypeScript.

Note that although the TypeScript compiler `tsc` actively supports certain JavaScript proposals such as optional chaining (`?.`), nullish coalescing (`??`) and class properties (`this.#x`), this preset does not include these features because they are not the types syntax available in TypeScript only. We recommend using `preset-env` with `preset-typescript` if you want to transpile these features.

## Example

**In**

```typescript
const x: number = 0;
```

**Out**

```typescript
const x = 0;
```

## Installation

```sh
npm install --save-dev @babel/plugin-transform-typescript
```

## Usage

### With a configuration file (Recommended)

```json
{
  "plugins": ["@babel/plugin-transform-typescript"]
}
```

### Via CLI

```sh
babel --plugins @babel/plugin-transform-typescript script.js
```

### Via Node API

```javascript
require("@babel/core").transformSync("code", {
  plugins: ["@babel/plugin-transform-typescript"],
});
```

## Options

### `allowDeclareFields`

`boolean`, defaults to `false`

Added in `v7.7.0`

> NOTE: This will be enabled by default in Babel 8

When enabled, type-only class fields are only removed if they are prefixed with the `declare` modifier:

```javascript
class A {
  declare foo: string; // Removed
  bar: string; // Initialized to undefined
}
```

### `allowNamespaces`

`boolean`, defaults to `true`.

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `v7.5.0` | Added `allowNamespaces`, defaults to `false` |
| `v7.13.0` | defaults to `true` |
</details>

Enables compilation of TypeScript namespaces.

### `isTSX`

`boolean`, defaults to `false`

Forcibly enables `jsx` parsing. Otherwise angle brackets will be treated as TypeScript's legacy type assertion `var foo = <string>bar;`. Also, `isTSX: true` requires `allExtensions: true`.

### `jsxPragma`

`string`, defaults to `React`

Replace the function used when compiling JSX expressions. This is so that we know that the import is not a type import, and should not be removed.

### `jsxPragmaFrag`

`string`, defaults to `React.Fragment`

Replace the function used when compiling JSX fragment expressions. This is so that we know that the import is not a type import, and should not be removed.

### `onlyRemoveTypeImports`

`boolean`, defaults to `false`

Added in: `v7.9.0`

When set to `true`, the transform will only remove [type-only imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-exports) (introduced in TypeScript 3.8). This should only be used if you are using TypeScript >= 3.8.

```javascript
class A {
  declare foo: string; // Removed
  bar: string; // Initialized to undefined
  prop?: string; // Initialized to undefined
  prop1!: string // Initialized to undefined
}
```

### `optimizeConstEnums`

`boolean`, defaults to `false`

Added in: `v7.15.0`

When set to `true`, Babel will inline enum values rather than using the usual `enum` output:
```typescript
// Input
const enum Animals {
  Fish
}
console.log(Animals.Fish);

// Default output
var Animals;

(function (Animals) {
  Animals[Animals["Fish"] = 0] = "Fish";
})(Animals || (Animals = {}));

console.log(Animals.Fish);

// `optimizeConstEnums` output
console.log(0);
```

This option differs from TypeScript's `--isolatedModules` behavior, which ignores the `const` modifiers compiling them as normal enums, and aligns Babel's behavior with the TypeScript default behavior.

However, when _exporting_ a `const enum` Babel will compile it to a plain object literal so that it doesn't need to rely on cross-file analysis when compiling it:
```typescript
// Input
export const enum Animals {
  Fish,
}

// `optimizeConstEnums` output
export var Animals = {
  Fish: 0,
};
```

## TypeScript Compiler Options

The official TypeScript compiler has many [options][tsc-options] for configuring how it
compiles and type checks. While many don't apply, some behaviors might be useful and their
equivalents in Babel can be enabled by some configuration options or plugins.

- `--alwaysStrict`
  You can use the `strictMode` [parser option](https://babeljs.io/docs/en/babel-parser#options):
  ```js
  module.exports = {
    parserOpts: { strictMode: true },
  };
  ```
- `--downlevelIteration`
  You can use the `@babel/plugin-transform-for-of` plugin. If you are using `@babel/preset-env`, `for...of` is already transpiled using iterators when it isn't supported by your compilation target(s).
- `--emitDecoratorMetadata`
  This option isn't supported by an official Babel package since it is a TypeScript-specific addition and not part of the decorators proposal.
  If you rely on this feature, you can use the community plugin [babel-plugin-transform-typescript-metadata](https://github.com/leonardfactory/babel-plugin-transform-typescript-metadata#readme).
- `--esModuleInterop`
  This is the default behavior of Babel when transpiling ECMAScript modules.
- `--experimentalDecorators`
  This option enables support for the "legacy" decorator proposal. You can enable it in Babel using the `@babel/plugin-proposal-decorators` plugin, but please be aware, there are some minor differences.
  ```js
  module.exports = {
    plugins: [["@babel/plugin-proposal-decorators", { legacy: true }]],
  };
  ```
- `--importHelpers`
  This is the equivalent of the `@babel/plugin-transform-runtime` package.
- `---importsNotUsedAsValues`
  You can use the `onlyRemoveTypeImports` option to replicate this behavior. `onlyRemoveTypeImports: true` is equivalent to `importsNotUsedAsValues: preserve`, while `onlyRemoveTypeImports: false` is equivalent to `importsNotUsedAsValues: remove`. There is no equivalent for `importsNotUsedAsValues: error`.
- `--inlineSourceMap`
  You can set the [`sourceMaps: "inline"`](https://babeljs.io/docs/en/options#sourcemaps) option in your `babel.config.json` file.
- `--isolatedModules`
  This is the default Babel behavior, and it can't be turned off because Babel doesn't support cross-file analysis.
- `--jsx`
  JSX support is provided using another plugin.
  If you want your output to contains JSX code (i.e. `--jsx preserve`), you need the `@babel/plugin-syntax-jsx` plugin; if you want to transpile it to standard JavaScript (i.e. `--jsx react` or `--jsx react-native`), you should use the `@babel/plugin-transform-react-jsx` plugin.
- `--jsxFactory`
  It can be customized using the [`pragma` option](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#pragma) of the `@babel/plugin-transform-react-jsx` package. You also need to set the `jsxPragma` option of this plugin.
- `--module`, `-m`
  If you are using a bundler (Webpack or Rollup), this option is set automatically.
  If you are using `@babel/preset-env`, you can use the [`modules` option](https://babeljs.io/docs/en/babel-preset-env#modules); otherwise you can load the specific plugin.

  | **`--module` value** | **`@babel/preset-env`'s `modules`** |             **Single plugin**              |
  | :------------------: | :---------------------------------: | :----------------------------------------: |
  |        `None`        |               `false`               |                     /                      |
  |      `CommonJS`      |       `"commonjs"` or `"cjs"`       | `@babel/plugin-transform-modules-commonjs` |
  |        `AMD`         |               `"amd"`               |   `@babel/plugin-transform-modules-amd`    |
  |       `System`       |            `"systemjs"`             | `@babel/plugin-transform-modules-systemjs` |
  |        `UMD`         |               `"umd"`               |   `@babel/plugin-transform-modules-umd`    |
  |  `ES6` or `ES2015`   |               `false`               |                     /                      |

- `--outDir`
  When using `@babel/cli`, you can set the [`--out-dir` option](https://babeljs.io/docs/en/babel-cli#compile-directories).
- `--outFile`
  Babel doesn't support concatenating output files: you should use a bundler (like Webpack, Rollup or Parcel) for that.
  When using `@babel/cli`, you can compile a single file using the [`--out-file` option](https://babeljs.io/docs/en/babel-cli#compile-files).
- `--sourceMap`
  You can use the top-level [`sourceMaps: true` option](https://babeljs.io/docs/en/options#sourcemaps).
- `--target`
  Babel doesn't support targeting a specific version of the language, but you can choose which engines you want to target using [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env).
  If you prefer, you can enable [individual plugins](https://babeljs.io/docs/en/plugins) for every ECMAScript feature.
- `--useDefineForClassFields`
  You can use the `onlyRemoveTypeImports` option to replicate this behavior.
- `--watch`, `-w`
  When using `@babel/cli`, you can specify the [`--watch` option](https://babeljs.io/docs/en/babel-cli#compile-files).

## Caveats

Because there are features of the TypeScript language which rely on the full type-system to be available to make changes at runtime. This section of caveats is quite long, however, it's worth noting that a few of these features are only found in older TypeScript codebases and have modern JavaScript equivalents which you are probably already using.

1. Since Babel does not type-check, code which is syntactically correct, but would fail the TypeScript type-checking may successfully get transformed, and often in unexpected or invalid ways.

1. This plugin does not support [`const enum`][const_enum]s because those require type information to compile.

   **Workarounds**:

   - Use the plugin [babel-plugin-const-enum](https://www.npmjs.com/package/babel-plugin-const-enum).
   - Remove the `const`, which makes it available at runtime.

1. This plugin does not support [`export =`][exin] and [`import =`][exin], because those cannot be compiled to ES.next. These are a TypeScript only form of `import`/`export`.

   **Workarounds**:

   - Use the plugin [babel-plugin-replace-ts-export-assignment](https://www.npmjs.com/package/babel-plugin-replace-ts-export-assignment) to transform `export =`.
   - Convert to using `export default` and `export const`, and `import x, {y} from "z"`.

1. Changes to your `tsconfig.json` are not reflected in babel. The build process will always behave as though [`isolatedModules`][iso-mods] is turned on, there are Babel-native alternative ways to set a lot of the [`tsconfig.json` options](#typescript-compiler-options) however.

1. **Q**: Why doesn't Babel allow export of a `var` or `let`?

   **A**: The TypeScript compiler dynamically changes how these variables are used depending on whether or not the value is mutated. Ultimately, this depends on a type-model and is outside the scope of Babel. A best-effort implementation would transform context-dependent usages of the variable to always use the `Namespace.Value` version instead of `Value`, in case it was mutated outside of the current file. Allowing `var` or `let` from Babel (as the transform is not-yet-written) is therefore is more likely than not to present itself as a bug when used as-if it was not `const`.

### Impartial Namespace Support

If you have existing code which uses the TypeScript-only [namespace][namespace] features. Babel supports a subset of TypeScript's namespace features. If you are considering writing new code which uses namespace, using the ES2015 `import`/`export` is recommended instead. It's [not going away][not-disappearing], but there are modern alternatives.

- Type-only `namespace`s should be marked with `declare` and will subsequently be safely removed.

- `export`ing a variable using `var` or `let` in a `namespace` will result in an error: _"Namespaces exporting non-const are not supported by Babel. Change to const or ..."_

  **Workaround**: Use `const`. If some form of mutation is required, explicitly use an object with internal mutability.

- `namespace`s will not share their scope. In TypeScript, it is valid to refer to contextual items that a `namespace` extends without qualifying them, and the compiler will add the qualifier. In Babel, there is no type-model, and it is impossible to dynamically change references to match the established type of the parent object.

  Consider this code:

  ```typescript
  namespace N {
    export const V = 1;
  }
  namespace N {
    export const W = V;
  }
  ```

  The TypeScript compiler compiles it to something like this:

  ```javascript
  var N = {};
  (function(N) {
    N.V = 1;
  })(N);
  (function(N) {
    N.W = N.V;
  })(N);
  ```

  While Babel will transform it to something like this:

  ```javascript
  var N;
  (function(_N) {
    const V = (_N = 1);
  })(N || (N = {}));
  (function(_N) {
    const W = V;
  })(N || (N = {}));
  ```

  As Babel doesn't understand the type of `N`, the reference to `V` will be `undefined` resulting in an error.

  **Workaround**: Explicitly refer to values not in the same namespace definition, even if they would be in the scope according to TypeScript. Examples:

  ```typescript
  namespace N {
    export const V = 1;
  }
  namespace N {
    export const W = N.V;
  }
  ```

  Or:

  ```typescript
  namespace N {
    export const V = 1;
    export const W = V;
  }
  ```

[const_enum]: https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
[exin]: https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
[iso-mods]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[namespace]: https://www.typescriptlang.org/docs/handbook/namespaces.html
[not-disappearing]: https://github.com/microsoft/TypeScript/issues/30994#issuecomment-484150549
[ts]: https://www.typescriptlang.org
[tsc-options]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
