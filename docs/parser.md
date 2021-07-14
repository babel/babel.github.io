---
id: babel-parser
title: @babel/parser
---

<p align="left">
  The Babel parser (previously Babylon) is a JavaScript parser used in <a href="https://github.com/babel/babel">Babel</a>.
</p>

- The latest ECMAScript version enabled by default (ES2020).
- Comment attachment.
- Support for JSX, Flow, Typescript.
- Support for experimental language proposals (accepting PRs for anything at least [stage-0](https://github.com/tc39/proposals/blob/master/stage-0-proposals.md)).

## Credits

Heavily based on [acorn](https://github.com/marijnh/acorn) and [acorn-jsx](https://github.com/RReverser/acorn-jsx),
thanks to the awesome work of [@RReverser](https://github.com/RReverser) and [@marijnh](https://github.com/marijnh).

## API

### `babelParser.parse(code, [options])`

### `babelParser.parseExpression(code, [options])`

`parse()` parses the provided `code` as an entire ECMAScript program, while
`parseExpression()` tries to parse a single Expression with performance in
mind. When in doubt, use `.parse()`.

### Options

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `v7.15.0` | Added `attachComment` |
| `v7.7.0` | Added `errorRecovery` |
| `v7.5.0` | Added `allowUndeclaredExports` |
| `v7.2.0` | Added `createParenthesizedExpressions` |
</details>

- **allowImportExportEverywhere**: By default, `import` and `export`
  declarations can only appear at a program's top level. Setting this
  option to `true` allows them anywhere where a statement is allowed.

- **allowAwaitOutsideFunction**: By default, `await` use is only allowed
  inside of an async function or, when the `topLevelAwait` plugin is enabled,
  in the top-level scope of modules. Set this to `true` to also accept it in the
  top-level scope of scripts. This option is discouraged in favor of
  `topLevelAwait` plugin.

- **allowReturnOutsideFunction**: By default, a return statement at
  the top level raises an error. Set this to `true` to accept such
  code.

- **allowSuperOutsideMethod**: By default, `super` use is not allowed
  outside of class and object methods. Set this to `true` to accept such
  code.

- **allowUndeclaredExports**: By default, exporting an identifier that was
  not declared in the current module scope will raise an error. While this
  behavior is required by the ECMAScript modules specification, Babel's
  parser cannot anticipate transforms later in the plugin pipeline that
  might insert the appropriate declarations, so it is sometimes important
  to set this option to `true` to prevent the parser from prematurely
  complaining about undeclared exports that will be added later.

- **attachComment**: By default, Babel attaches comments to adjacent AST nodes. When this option is set to `false`, comments are not attached. It can provide up to 30% performance improvement when the input code has _many_ comments. `@babel/eslint-parser` will set it for you. It is not recommended to use `attachComment: false` with Babel transform, as doing so removes all the comments in output code, and renders annotations such as `/* istanbul ignore next */` nonfunctional.

- **createParenthesizedExpressions**: By default, the parser sets `extra.parenthesized` on the expression nodes. When this option is set to `true`, `ParenthesizedExpression` AST nodes are created instead.

- **errorRecovery**: By default, Babel always throws an error when it finds some invalid
  code. When this option is set to `true`, it will store the parsing error and try to continue
  parsing the invalid input file.
  The resulting AST will have an `errors` property representing an array of all the parsing errors.
  Note that even when this option is enabled, `@babel/parser` could throw for unrecoverable errors.

- **plugins**: Array containing the plugins that you want to enable.

- **sourceType**: Indicate the mode the code should be parsed in. Can be
  one of `"script"`, `"module"`, or `"unambiguous"`. Defaults to `"script"`. `"unambiguous"` will make @babel/parser attempt to _guess_, based on the presence of ES6 `import` or `export` statements. Files with ES6 `import`s and `export`s are considered `"module"` and are otherwise `"script"`.

- **sourceFilename**: Correlate output AST nodes with their source filename. Useful when generating code and source maps from the ASTs of multiple input files.

- **startLine**: By default, the first line of code parsed is treated as line 1. You can provide a line number to alternatively start with. Useful for integration with other source tools.

- **strictMode**: By default, ECMAScript code is parsed as strict only if a
  `"use strict";` directive is present or if the parsed file is an ECMAScript
  module. Set this option to `true` to always parse files in strict mode.

- **ranges**: Adds a `range` property to each node: `[node.start, node.end]`

- **tokens**: Adds all parsed tokens to a `tokens` property on the `File` node

### Output

The Babel parser generates AST according to [Babel AST format][].
It is based on [ESTree spec][] with the following deviations:

- [Literal][] token is replaced with [StringLiteral][], [NumericLiteral][], [BigIntLiteral][], [BooleanLiteral][], [NullLiteral][], [RegExpLiteral][]
- [Property][] token is replaced with [ObjectProperty][] and [ObjectMethod][]
- [MethodDefinition][] is replaced with [ClassMethod][]
- [Program][] and [BlockStatement][] contain additional `directives` field with [Directive][] and [DirectiveLiteral][]
- [ClassMethod][], [ObjectProperty][], and [ObjectMethod][] value property's properties in [FunctionExpression][] is coerced/brought into the main method node.
- [ChainExpression][] is replaced with [OptionalMemberExpression][] and [OptionalCallExpression][]
- [ImportExpression][] is replaced with a [CallExpression][] whose `callee` is an [Import] node.

> There is now an `estree` plugin which reverts these deviations

AST for JSX code is based on [Facebook JSX AST][].

[babel ast format]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md
[estree spec]: https://github.com/estree/estree
[literal]: https://github.com/estree/estree/blob/master/es5.md#literal
[property]: https://github.com/estree/estree/blob/master/es5.md#property
[methoddefinition]: https://github.com/estree/estree/blob/master/es2015.md#methoddefinition
[chainexpression]: https://github.com/estree/estree/blob/master/es2020.md#chainexpression
[importexpression]: https://github.com/estree/estree/blob/master/es2020.md#importexpression
[stringliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#stringliteral
[numericliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#numericliteral
[bigintliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#bigintliteral
[booleanliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#booleanliteral
[nullliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#nullliteral
[regexpliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#regexpliteral
[objectproperty]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#objectproperty
[objectmethod]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#objectmethod
[classmethod]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#classmethod
[program]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#programs
[blockstatement]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#blockstatement
[directive]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#directive
[directiveliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#directiveliteral
[functionexpression]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#functionexpression
[optionalmemberexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#optionalmemberexpression
[optionalcallexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#optionalcallexpression
[callexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#callexpression
[import]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#import
[facebook jsx ast]: https://github.com/facebook/jsx/blob/master/AST.md

### Semver

The Babel Parser follows semver in most situations. The only thing to note is that some spec-compliancy bug fixes may be released under patch versions.

For example: We push a fix to early error on something like [#107](https://github.com/babel/babylon/pull/107) - multiple default exports per file. That would be considered a bug fix even though it would cause a build to fail.

### Example

```javascript
require("@babel/parser").parse("code", {
  // parse in strict mode and allow module declarations
  sourceType: "module",

  plugins: [
    // enable jsx and flow syntax
    "jsx",
    "flow",
  ],
});
```

### Plugins

#### Miscellaneous

| Name                                                | Code Example |
| --------------------------------------------------- | ------------ |
| `estree` ([repo](https://github.com/estree/estree)) | n/a          |

#### Language extensions

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `v7.6.0` | Added `v8intrinsic` |
</details>
| Name | Code Example |
|------|--------------|
| `flow` ([repo](https://github.com/facebook/flow)) | `var a: string = "";` |
| `flowComments` ([docs](https://flow.org/en/docs/types/comments/)) | `/*:: type Foo = {...}; */` |
| `jsx` ([repo](https://facebook.github.io/jsx/)) | `<a attr="b">{s}</a>` |
| `typescript` ([repo](https://github.com/Microsoft/TypeScript)) | `var a: string = "";` |
| `v8intrinsic` | `%DebugPrint(foo);` |

#### ECMAScript [proposals](https://github.com/babel/proposals)

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `v7.14.0` | Added `asyncDoExpressions`. Moved `classProperties`, `classPrivateProperties`, `classPrivateMethods`, `moduleStringNames` to Latest ECMAScript features |
| `v7.13.0` | Added `moduleBlocks` |
| `v7.12.0` | Added `classStaticBlock`, `moduleStringNames` |
| `v7.11.0` | Added `decimal` |
| `v7.10.0` | Added `privateIn` |
| `v7.9.0` | Added `recordAndTuple` |
| `v7.7.0` | Added `topLevelAwait` |
| `v7.4.0` | Added `partialApplication` |
| `v7.2.0` | Added `classPrivateMethods` |
</details>

| Name                                                                                            | Code Example                                             |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `asyncDoExpressions` ([proposal](https://github.com/tc39/proposal-async-do-expressions))        | `async do { await requestAPI().json() }`                 |
| `classStaticBlock` ([proposal](https://github.com/tc39/proposal-class-static-block))            | `class A { static {} }`                                  |
| `decimal` ([proposal](https://github.com/tc39/proposal-decimal))                                | `0.3m`                                                   |
| `decorators` ([proposal](https://github.com/tc39/proposal-decorators)) <br> `decorators-legacy` | `@a class A {}`                                          |
| `doExpressions` ([proposal](https://github.com/tc39/proposal-do-expressions))                   | `var a = do { if (true) { 'hi'; } };`                    |
| `exportDefaultFrom` ([proposal](https://github.com/tc39/ecmascript-export-default-from))        | `export v from "mod"`                                    |
| `functionBind` ([proposal](https://github.com/zenparsing/es-function-bind))                     | `a::b`, `::console.log`                                  |
| `importAssertions` ([proposal](https://github.com/tc39/proposal-import-assertions))             | `import json from "./foo.json" assert { type: "json" };` |
| `moduleBlocks` ([proposal](https://github.com/tc39/proposal-js-module-blocks))                  | `let m = module { export let y = 1; };`                  |
| `partialApplication` ([proposal](https://github.com/babel/proposals/issues/32))                 | `f(?, a)`                                                |
| `pipelineOperator` ([proposal](https://github.com/babel/proposals/issues/29))                   | <code>a &#124;> b</code>                                 |
| `privateIn` ([proposal](https://github.com/tc39/proposal-private-fields-in-in))                 | `#p in obj`                                              |
| `recordAndTuple` ([proposal](https://github.com/tc39/proposal-record-tuple))                    | `#{x: 1}`, `#[1, 2]`                                     |
| `throwExpressions` ([proposal](https://github.com/babel/proposals/issues/23))                   | `() => throw new Error("")`                              |
| `topLevelAwait` ([proposal](https://github.com/tc39/proposal-top-level-await/))                 | `await promise` in modules                               |

#### Latest ECMAScript features

The following features are already enabled on the latest version of `@babel/parser`, and cannot be disabled because they are part of the language.
You should enable these features only if you are using an older version.

| Name                                                                                      | Code Example                                        |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `asyncGenerators` ([proposal](https://github.com/tc39/proposal-async-iteration))          | `async function*() {}`, `for await (let a of b) {}` |
| `bigInt` ([proposal](https://github.com/tc39/proposal-bigint))                            | `100n`                                              |
| `classProperties` ([proposal](https://github.com/tc39/proposal-class-public-fields))      | `class A { b = 1; }`                                |
| `classPrivateProperties` ([proposal](https://github.com/tc39/proposal-private-fields))    | `class A { #b = 1; }`                               |
| `classPrivateMethods` ([proposal](https://github.com/tc39/proposal-private-methods))      | `class A { #c() {} }`                               |
| `dynamicImport` ([proposal](https://github.com/tc39/proposal-dynamic-import))             | `import('./guy').then(a)`                           |
| `exportNamespaceFrom` ([proposal](https://github.com/leebyron/ecmascript-export-ns-from)) | `export * as ns from "mod"`                         |
| `functionSent` ([proposal](https://github.com/tc39/proposal-function.sent))               | `function.sent`                                     |
| `logicalAssignment` ([proposal](https://github.com/tc39/proposal-logical-assignment))     | `a &&= b`                                           |
| `moduleStringNames` ([proposal](https://github.com/tc39/ecma262/pull/2154))               | `import { "😄" as smile } from "emoji";`            |
| `nullishCoalescingOperator` ([proposal](https://github.com/babel/proposals/issues/14))    | `a ?? b`                                            |
| `numericSeparator` ([proposal](https://github.com/samuelgoto/proposal-numeric-separator)) | `1_000_000`                                         |
| `objectRestSpread` ([proposal](https://github.com/tc39/proposal-object-rest-spread))      | `var a = { b, ...c };`                              |
| `optionalCatchBinding` ([proposal](https://github.com/babel/proposals/issues/7))          | `try {throw 0;} catch{do();}`                       |
| `optionalChaining` ([proposal](https://github.com/tc39/proposal-optional-chaining))       | `a?.b`                                              |

#### Plugins options

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `7.14.0` | Added `dts` for `typescript` plugin |
</details>

> NOTE: When a plugin is specified multiple times, only the first options are considered.

- `decorators`:

  - `decoratorsBeforeExport` (`boolean`)

    ```js
    // decoratorsBeforeExport: true
    @dec
    export class C {}

    // decoratorsBeforeExport: false
    export @dec class C {}
    ```

- `pipelineOperator`:

  - `proposal` (required, accepted values: `minimal`, `smart`, `fsharp`)
    There are different proposals for the pipeline operator. This option
    allows to choose which one to use.
    See [What's Happening With the Pipeline (|>) Proposal?](https://babeljs.io/blog/2018/07/19/whats-happening-with-the-pipeline-proposal) for more information.

- `recordAndtuple`:

  - `syntaxType` (required, accepted values: `hash`, `bar`)
    There are two syntax variants for `recordAndTuple`. They share exactly same runtime semantics.
    | SyntaxType | Record Example | Tuple Example |
    | --- | --- | --- |
    | `"hash"` | `#{ a: 1 }` | `#[1, 2]` |
    | `"bar"` | <code>{&#124; a: 1 &#124;}</code> | <code>[&#124;1, 2&#124;]</code> |
    See [Ergonomics of `#{}`/`#[]`](https://github.com/tc39/proposal-record-tuple/issues/10) for more information.

- `flow`:

  - `all` (`boolean`, default: `false`)
    Some code has different meaning in Flow and in vanilla JavaScript. For example, `foo<T>(x)` is parsed as a call expression with a type argument in Flow, but as a comparison (`foo < T > x`) accordingly to the ECMAScript specification. By default, `babel-parser` parses those ambiguous constructs as Flow types only if the file starts with a `// @flow` pragma.
    Set this option to `true` to always parse files as if `// @flow` was specified.

- `typescript`
  - `dts` (`boolean`, default `false`)
    This option will enable parsing within a TypeScript ambient context, where certain syntax have different rules (like `.d.ts` files and inside `declare module` blocks). Please see https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html and https://basarat.gitbook.io/typescript/type-system/intro for more information about ambient contexts.

### Error codes

<details>
  <summary>History</summary>
| Version | Changes |
| --- | --- |
| `v7.14.0` | Added error codes |
</details>

Error codes are useful for handling the errors thrown by `@babel/parser`.

There are two error codes, `code` and `reasonCode`.

- `code`
  - Rough classification of errors (e.g. `BABEL_PARSER_SYNTAX_ERROR`, `BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED`).
- `reasonCode`
  - Detailed classification of errors (e.g. `MissingSemicolon`, `VarRedeclaration`).

Example of using error codes with `errorRecovery`:

```js
const { parse } = require("@babel/parser");

const ast = parse(`a b`, { errorRecovery: true });

console.log(ast.errors[0].code); // BABEL_PARSER_SYNTAX_ERROR
console.log(ast.errors[0].reasonCode); // MissingSemicolon
```

### FAQ

#### Will the Babel parser support a plugin system?

Previous issues: [#1351](https://github.com/babel/babel/issues/1351), [#6694](https://github.com/babel/babel/issues/6694).

We currently aren't willing to commit to supporting the API for plugins or the resulting ecosystem (there is already enough work maintaining Babel's own plugin system). It's not clear how to make that API effective, and it would limit our ability to refactor and optimize the codebase.

Our current recommendation for those that want to create their own custom syntax is for users to fork the parser.

To consume your custom parser, you can add a plugin to your [options](options.md#plugins) to call the parser via its npm package name or require it if using JavaScript,

```js
const parse = require("custom-fork-of-babel-parser-on-npm-here");

module.exports = {
  plugins: [
    {
      parserOverride(code, opts) {
        return parse(code, opts);
      },
    },
  ],
};
```
