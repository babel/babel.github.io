---
id: babel-preset-typescript
title: @babel/preset-typescript
---

This preset is recommended if you use [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html), a typed superset of JavaScript. It includes the following plugins:

- [@babel/plugin-transform-typescript](plugin-transform-typescript.md)

> You will need to specify `--extensions ".ts"` for `@babel/cli` & `@babel/node` cli's to handle `.ts` files.

## Example

**In**

```typescript
const x: number = 0;
```

**Out**

```javascript
const x = 0;
```

## Installation

```sh
npm install --save-dev @babel/preset-typescript
```

## Usage

### With a configuration file (Recommended)

```json
{
  "presets": ["@babel/preset-typescript"]
}
```

### Via CLI

```sh
babel --presets @babel/preset-typescript script.ts
```

### Via Node API

```javascript
require("@babel/core").transformSync("code", {
  presets: ["@babel/preset-typescript"],
});
```

## Options

### `isTSX`

`boolean`, defaults to `false`

Forcibly enables `jsx` parsing. Otherwise angle brackets will be treated as typescript's legacy type assertion `var foo = <string>bar;`. Also, `isTSX: true` requires `allExtensions: true`.

### `jsxPragma`

`string`, defaults to `React`

Replace the function used when compiling JSX expressions. This is so that we know that the import is not a type import, and should not be removed.

### `jsxPragmaFrag`

`string`, defaults to `React.Fragment`

Replace the function used when compiling JSX fragment expressions. This is so that we know that the import is not a type import, and should not be removed.

### `allExtensions`

`boolean`, defaults to `false`

Indicates that every file should be parsed as TS or TSX (depending on the `isTSX` option).

### `allowNamespaces`

`boolean`, uses the default set by [`@babel/plugin-transform-typescript`](https://babeljs.io/docs/en/babel-plugin-transform-typescript#allownamespaces).

Added in: `v7.6.0`

Enables compilation of TypeScript namespaces.

### `allowDeclareFields`

`boolean`, defaults to `false`

Added in: `v7.7.0`

> NOTE: This will be enabled by default in Babel 8

When enabled, type-only class fields are only removed if they are prefixed with the `declare` modifier:

```typescript
class A {
  declare foo: string; // Removed
  bar: string; // Initialized to undefined
  prop?: string; // Initialized to undefined
  prop1!: string // Initialized to undefined
}
```

### `onlyRemoveTypeImports`

`boolean`, defaults to `false`

Added in: `v7.9.0`

When set to `true`, the transform will only remove [type-only imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-exports) (introduced in TypeScript 3.8). This should only be used if you are using TypeScript >= 3.8.

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

> You can read more about configuring preset options [here](https://babeljs.io/docs/en/presets#preset-options).
