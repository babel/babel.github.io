---
title: "升级到Babel 7"
id:v7-迁移
---

当升级 Babel 7 的时候把该文档交接给使用者 。 点击 [这里](v7-migration-api.md) for API/integration 的变化.

<!--truncate-->

因为不是每一个突破性的改变都会影响每一个工程, 所以我们已经按照升级时会带来的破坏性测试的可能情况，对某些部分进行了排序。

## Babel 大览

> 对 Node.js 0.10, 0.12, 4 and 5 的支持已被遗弃了 [#5025](https://github.com/babel/babel/pull/5025), [#5041](https://github.com/babel/babel/pull/5041), [#7755](https://github.com/babel/babel/pull/7755), [#5186](https://github.com/babel/babel/pull/5186)

因为之前的Nodejs版本不再维护了，我们强烈推荐您使用新版的Node.js (LTS v8) 。
查看 [nodejs/LTS](https://github.com/nodejs/LTS) 获取更多信息。

这就意味着Babel _自己_ 不会在更老的版本的Node上运行了。不过，它仍然可以输出在旧版本的Node上运行的代码。

## 配置查找的变化

更多详情, 请阅读我们的 [6.x vs 7.x comparison](config-files.md#6x-vs-7x-babelrc-loading).
以前，Babel在处理`node_modules`、symlinks 和 monorepos时遇到过一些问题。我们对此做了一些更改：Babel将停止在`package.json`边界上查找，而不是查找依赖链。对于monorepos，我们添加了一个新的`babel.config.js`文件，它将我们的配置集中在所有包中（或者可以为每个包创建一个配置）。在Babel 7.1中，我们引入了[`rootMode`]（options.md#rootMode）这一个选项，以便在必要时进一步查找。

## [年度废弃掉的preset](/blog/2017/12/27/nearing-the-7.0-release.html#deprecated-yearly-presets-eg-babel-preset-es20xx)

“env” preset 已经发布了一年多了，完全取代了我们之前的一些 preset 和建议。
- `babel-preset-es2015`
- `babel-preset-es2016`
- `babel-preset-es2017`
- `babel-preset-latest`
- 以上都是废弃的 ^
- 
这些preset都会被 "env"给取而代之。

## [Stage Preset 的废弃](https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets)

为了支持显式提议的使用，我们正在移除stage presets. 可以查看 [stage-0 README](https://github.com/babel/babel/tree/755ec192e22c6b6e00782e4810366d0166fdbebd/packages/babel-preset-stage-0#babelpreset-stage-0) 获取更多详情。

你可以运行 [`npx babel-upgrade`] 来自动废弃Stage Preset (https://github.com/babel/babel-upgrade) (PR added [here](https://github.com/babel/babel-upgrade/pull/69)).

## [Remove proposal polyfills in `@babel/polyfill`](https://github.com/babel/babel/issues/8416)

基于类似的想法, 我们已经移除了 来自 `@babel/polyfill`的 polyfill 提案。

现在 `@babel/polyfill` 差不多就是 `core-js` v2 的别名了。 [资源](https://github.com/babel/babel/blob/master/packages/babel-polyfill/src/index.js)

在此之前要有两个import:

```js
import "core-js/shim"; // included < Stage 4 proposals
import "regenerator-runtime/runtime";
```

如果你想使用相关提案, 你就要单独地导入这些依赖项。你应该直接从npm上的 [`core-js`](https://github.com/zloirock/core-js/tree/v2#usage) 和另外一个包导入。

例子

```js
// 适应 core-js v2:
import "core-js/fn/array/flat-map";

// 适应 core-js v3:
import "core-js/features/array/flat-map";
```

在 `core-js` v2 版本中，以下是 Stage<3 的一系列的提案polyfills 。

<details>

```js
// core-js v2

// Stage 3
import "core-js/fn/string/trim-left";
import "core-js/fn/string/trim-right";
import "core-js/fn/string/match-all";
import "core-js/fn/array/flat-map";
import "core-js/fn/array/flatten"; // RENAMED
import "core-js/fn/global";

// Stage 1
import "core-js/fn/symbol/observable";
import "core-js/fn/promise/try";
import "core-js/fn/observable";

// Stage 1 数学拓展
import "core-js/fn/math/clamp";
import "core-js/fn/math/deg-per-rad";
import "core-js/fn/math/degrees";
import "core-js/fn/math/fscale";
import "core-js/fn/math/iaddh";
import "core-js/fn/math/isubh";
import "core-js/fn/math/imulh";
import "core-js/fn/math/rad-per-deg";
import "core-js/fn/math/radians";
import "core-js/fn/math/scale";
import "core-js/fn/math/umulh";
import "core-js/fn/math/signbit";

// Stage 1 "of and from on collection constructors"
import "core-js/fn/map/of";
import "core-js/fn/set/of";
import "core-js/fn/weak-map/of";
import "core-js/fn/weak-set/of";
import "core-js/fn/map/from";
import "core-js/fn/set/from";
import "core-js/fn/weak-map/from";
import "core-js/fn/weak-set/from";

// Stage 0
import "core-js/fn/string/at";

// 非标准
import "core-js/fn/object/define-getter";
import "core-js/fn/object/define-setter";
import "core-js/fn/object/lookup-getter";
import "core-js/fn/object/lookup-setter";
// import "core-js/fn/map/to-json"; // Not available standalone
// import "core-js/fn/set/to-json"; // Not available standalone

import "core-js/fn/system/global";
import "core-js/fn/error/is-error";
import "core-js/fn/asap";

// 装饰器元数据? stage/proposal 未确定
import "core-js/fn/reflect/define-metadata";
import "core-js/fn/reflect/delete-metadata";
import "core-js/fn/reflect/get-metadata";
import "core-js/fn/reflect/get-metadata-keys";
import "core-js/fn/reflect/get-own-metadata";
import "core-js/fn/reflect/get-own-metadata-keys";
import "core-js/fn/reflect/has-metadata";
import "core-js/fn/reflect/has-own-metadata";
import "core-js/fn/reflect/metadata";
```

</details>

## [版本控制/依赖项](/blog/2017/12/27/nearing-the-7.0-release.html#peer-dependencies-integrations)

大多数的插件或者是顶层的包，现在有了个 `peerDependency` (同级依赖) ，位于 `@babel/core` 包内。

## 对一些包名的重置

- `babylon` 现在是 `@babel/parser`了。
- 
您仍然可以在配置中，使用包名的速记版本（去掉前缀 'preset-'或'plugin-`），但是为了清晰起见，我还是选择了使用整个包名（我们也许要删除这短话，因为它节省不了那么多文本）。

``` 对比
{
-  "presets": ["@babel/preset-react"],
+  "presets": ["@babel/react"], // this is equivalent
-  "plugins": ["@babel/transform-runtime"],
+  "plugins": ["@babel/plugin-transform-runtime"], // same
}
```

### 作用域包

最终，最重要的变化是将所有包切换到 [scoped packages](/blog/2017/12/27/nearing-the-7.0-release.html#renames-scoped-packages-babel-x) (文件夹名在 [monorepo](https://github.com/babel/babel/tree/main/packages) 未更改，但是名字依旧写在 它的 `package.json` is)。
这意味着将不会再有意外或者是有意得名称占用问题，与社区插件的明确得分离，以及更简单得命名约定。

您的依赖项需要进行如下修改：
`babel cli`->`@babel/cli`。对我们来讲，我们基本上是从 `babel-` 替换 `@babel/` 开始的。

#### 启用配置

您仍然可以使用指定预设或插件的速记方式。但是，由于切换到作用域包，还是必须要指定“@babel/”，就像您有自己的preset要添加到配置中一样。

```js
module.exports = {
  presets: ["@babel/env"], // "@babel/preset-env"
  plugins: ["@babel/transform-arrow-functions"], // same as "@babel/plugin-transform-arrow-functions"
};
```

### [Switch to `-proposal-` for TC39 Proposals](/blog/2017/12/27/nearing-the-7.0-release.html#renames-proposal)

在年度版本（ES2015、ES2016等）中，这意味着任何不中的插件都应该重命名为`-proposal`。这样我们就可以更好地表示一个提议不是正式的JavaScript。

示例:

- `@babel/plugin-transform-function-bind` 现在是 `@babel/plugin-proposal-function-bind` (Stage 0)
- `@babel/plugin-transform-class-properties` 现在是 `@babel/plugin-proposal-class-properties` (Stage 3)

这也意味着当一个提议进入stage-4时，我们应该把这个包重命名。

### [移除包名中的年份字样](/blog/2017/12/27/nearing-the-7.0-release.html#renames-drop-the-year-from-the-plugin-name)

某些插件的名字含有 `-es3-` or `-es2015-` , 但这些表示年份的字样不重要.

`@babel/plugin-transform-es2015-classes` 变成了 `@babel/plugin-transform-classes`.

##  在 CommonJS 中的 `"use strict"` 以及 `this`

babel6对ES6模块的转换三七二十一地运行在它被要求处理的任何文件上，从不考虑文件中是否有ES6导入/导出。这样做的结果是把文件范围内对`this`的引用重写成了`undefined`，并且还在Babel处理的所有CommonJS模块的顶部插入严格模式`"use strict"`。
```js
// input.js
this;
```

```js
// output.js v6
"use strict"; // 启用严格模式
undefined; // 把 this 转化成了 undefined
```

```js
// output.js v7
this;
```

因此对于`transform-es2015-modules-commonjs`的转义行为，以上转译行为在Babel 7中受到了限制，只有在文件中有ES6导入或导出时，才会更改文件(编者按：如果我们进入https://github.com/babel/babel/issues/6242，情况可能会再次改变，因此我们希望在发布之前重新讨论）。

```js
// input2.js
import "a";
```

```js
// output.js v6 和 v7
"use strict";
require("a");
```

如果您依赖Babel将`"use strict"`自动注入到所有CommonJS模块中，那么您需要在Babel配置中显式地使用`transform-strict-mode`插件。

## React和Flow Presets的分离

`babel-preset-react` 总是包含flow插件。这就导致了很多问题，因为用户无意使用了`flow`语法，或者在没有使用`flow`本身进行类型检查的情况下添加了`flow`，从而导致了错误。

当我们决定支持TypeScript时，这个问题变得更加复杂。如果您想使用React和TypeScript预设，我们必须找到一种方法，通过文件类型或指令自动打开/关闭语法。最后，更容易完全分离 presets。

Presets使Babel能够解析Flow/TypeScript（以及其他方言/语言）提供的类型，然后在编译为JavaScript时将它们去掉。

```diff
{
-  "presets": ["@babel/preset-react"]
+  "presets": ["@babel/preset-react", "@babel/preset-flow"] // parse & remove flow types
+  "presets": ["@babel/preset-react", "@babel/preset-typescript"] // parse & remove typescript types
}
```

## Option 的解析

现在Babel的配置选项比Babel 6更严格。
如果预设列表以逗号分隔，例如`"presets": 'es2015, es2016'`以前在技术上用过，现在是运行失败的，需要更改为键值对的值改为数组而不是字符串[#5463](https://github.com/babel/babel/pull/5463).

注意：这不适用于CLI，其中`--presets es2015,es2016`肯定仍然有效。

```diff
{
-  "presets": "@babel/preset-env, @babel/preset-react"
+  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

## Plugin/Preset 导出

所有的插件或者预设，现在都应该导出一个函数而不是一个对象来保持一致性（[查看 babel/babel#6494](https://github.com/babel/babel/pull/6494))。 这里帮我们进行了缓存。

## 处理基于字符串的配置值

在babel6中，直接传递给Babel的值（不是来自配置文件）是相对于正在编译的文件进行解析得到的，这导致了很多不一致的情况。

在babel7中，值的解析要么与加载它们的配置文件一致，要么与工作目录一致。
对于 `presets` and `plugins` 的值, 此更改意味着CLI在以下情况下可以正常工作：

```bash
babel --presets @babel/preset-env ../file.js
```

假设您的 `node_modules` 文件夹位于 `.`, 在 Babel 6 中，由于找不到preset，该操作会失败。

此更改还影响`only`和`ignore` ，它们将在下一项展开说明。

## 基于路径的`only`和`ignore`模式

在Babel 6中，`only`和`ignore`被视为通用匹配字符串，而不是文件路径的glob匹配。这意味着，例如`*.foo.js`能够匹配`./**/*.foo.js`的情况，对于大多数用户来说是令人困惑和惊讶的。

在Babel 7中，这些被视为基于路径的glob匹配模式，可以是相对路径，也可以是绝对路径。这意味着，如果您正在使用这些模式，您现在可能至少需要为它们添加一个`**/`前缀，以确保您的模式与目录中的深度匹配。

`only` 和 `ignore` 模式 _的确_ 还适用于目录, 因此您也可以只使用 `only: './tests'` 来编译`tests`目录中的文件, 而不需要使用 `**/*.js`来匹配所有嵌套文件。

## Babel的脚手架命令

`babel`命令的`--copy-files`参数告诉Babel复制Babel不知道如何处理的目录中的所有文件，现在也将把复制未通过`only`/`ignore` 检查的文件，在此之前它将自动跳过所有被忽略的文件。

### `@babel/node`

Babel 6中的`babel-node`命令`babel-cli`包的一部分。在Babel 7中，这个命令已经被拆分到它自己的`@babel/node`包中，因此如果您正在使用这个命令，您将需要添加这个新的依赖项。

### `@babel/runtime`, `@babel/plugin-transform-runtime`

我们已经将Babel的helpers从运行时的“polyfilling”行为中分离出来。更多详情请参见[PR](https://github.com/babel/babel/pull/8266)。

[`@babel/runtime`]（runtime.md）现在只包含helpers，如果需要`core-js`，可以使用[`@babel/runtime-corejs2`]（runtime-corejs2.md）和转换中提供的选项。对于这两者，您仍然需要[`@babel/plugin transform runtime`]（plugin transform runtime.md）

#### Only Helpers

```sh
# 安装运行时作为依赖
npm install @babel/runtime
# 安装该插件作为开发依赖
npm install @babel/plugin-transform-runtime --save-dev
```

```json
{
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

#### 来自`core-js`的 Helpers + polyfilling 

So if you need `core-js` support with `transform-runtime`, you would now pass the `corejs` option and use the `@babel/runtime-corejs2` dependency instead of `@babel/runtime`.

```sh
# 安装运行时作为依赖
npm install @babel/runtime-corejs2
# 安装该插件作为开发依赖
npm install @babel/plugin-transform-runtime --save-dev
```

```对比
{
  "plugins": [
-   ["@babel/plugin-transform-runtime"],
+   ["@babel/plugin-transform-runtime", {
+     "corejs": 2,
+   }],
  ]
}
```

---

## 特指的合规性

### `@babel/plugin-proposal-object-rest-spread`

> 尾部逗号不能位于对象中的rest形式的成员的后面 [#290](https://github.com/babel/babylon/pull/290) ![medium](https://img.shields.io/badge/risk%20of%20breakage%3F-medium-yellow.svg)

```对比
var {
-  ...y, // 这个成员的尾部接上逗号是语法错误
+  ...y
} = { a: 1 };
```

---

> 由于Object Spread定义了新的属性，而 `Object.assign`只是设置它们，Babel将默认行为改得更符合规范。

- [objectSpread helper function](https://github.com/babel/babel/blob/007bfb656502a44f6ab50cd64750cc4b38f9efff/packages/babel-helpers/src/helpers.js#L375)
- [extends helper function](https://github.com/babel/babel/blob/007bfb656502a44f6ab50cd64750cc4b38f9efff/packages/babel-helpers/src/helpers.js#L357-L373)

```js
// input
z = { x, ...y };
```

```js
// Babel v7 默认行为: ["proposal-object-rest-spread"]
function _objectSpread(target) { ... }

z = _objectSpread({
  x
}, y);
```

```js
// 老版本Babel v6 行为: ["proposal-object-rest-spread", { "loose": true }]
function _extends(target) { ... }

z = _extends({
  x
}, y);
```

```js
// 取代 Object.assign: ["proposal-object-rest-spread", { "loose": true, "useBuiltIns": true }]
z = Object.assign(
  {
    x,
  },
  y
);
```

### `@babel/plugin-proposal-class-properties`

默认行为将更改为以前默认的“spec”

```js
// input
class Bork {
  static a = "foo";
  y;
}
```

```js
// Babel v7 默认行为: ["@babel/plugin-proposal-class-properties"]
var Bork = function Bork() {
  Object.defineProperty(this, "y", {
    enumerable: true,
    writable: true,
    value: void 0,
  });
};

Object.defineProperty(Bork, "a", {
  enumerable: true,
  writable: true,
  value: "foo",
});
```

```js
// 老版本Babel v6 行为: ["@babel/plugin-proposal-class-properties", { "loose": true }]
var Bork = function Bork() {
  this.y = void 0;
};

Bork.a = "foo";
```

### 分割 `@babel/plugin-transform-export-extensions` 成两个重命名的建议

这个未来很漫长，但最终会得到改变。

`@babel/plugin-proposal-export-default-from`

```js
export v from "mod";
```

`@babel/plugin-proposal-export-namespace-from`

```js
export * as ns from "mod";
```

### `@babel/plugin-transform-template-literals`

> 模板文本修订已更新 [#5523](https://github.com/babel/babel/pull/5523) ![low](https://img.shields.io/badge/risk%20of%20breakage%3F-low-yellowgreen.svg)

See the proposal for [Template Literals Revision](https://tc39.github.io/proposal-template-literal-revision/).

它导致Babel 6抛出'坏字符转义序列（5:6）`。

```js
tag`\unicode and \u{55}`;
```

这在Babel 7中已被修复，并生成如下内容：

```js
// default
function _taggedTemplateLiteral(strings, raw) {
  return Object.freeze(
    Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })
  );
}
var _templateObject = /*#__PURE__*/ _taggedTemplateLiteral(
  [void 0],
  ["\\unicode and \\u{55}"]
);
tag(_templateObject);
```

```js
// loose mode
function _taggedTemplateLiteralLoose(strings, raw) {
  strings.raw = raw;
  return strings;
}
var _templateObject = /*#__PURE__*/ _taggedTemplateLiteralLoose(
  [void 0],
  ["\\unicode and \\u{55}"]
);
tag(_templateObject);
```

---

> 对于常规模板文本，默认为以前的“spec”模式

```js
// input
`foo${bar}`;
```

```js
// 默认Babel v7表现: ["@babel/plugin-transform-template-literals"]
"foo".concat(bar);
```

```js
// 老版本Babel v6表现: ["@babel/plugin-transform-template-literals", { "loose": true }]
"foo" + bar;
```

### `@babel/plugin-proposal-decorators`

在关于装饰器的新建议实现的预期中，我们决定将其作为新的默认行为。这意味着要继续使用当前的装饰器语法或者行为，一定要将`legacy`选项设置为`true`。

```对比
 {
   "plugins": [
-    "@babel/plugin-proposal-decorators"
+    ["@babel/plugin-proposal-decorators", { "legacy": true }]
   ]
 }
```

> 注意：如果您使用的是包含此插件的`@babel/preset-stage-0`或`@babel/preset-stage-1`，则必须向它们传递`decoratorsLegacy` 选项。

### `@babel/plugin-proposal-pipeline-operator`

在flux中更新的提议默认会出错，并且要求每个人都选择一个特定的提案，而事情仍然处于< Stage 2。这篇文章对此作了很多解释 [post](https://babeljs.io/blog/2018/07/19/whats-happening-with-the-pipeline-proposal).

```对比
{
  "plugins": [
-   "@babel/plugin-proposal-pipeline-operator"
+   ["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }]
  ]
}
```

### 移除了的 `babel-plugin-transform-class-constructor-call`

> babel插件转换类构造函数调用已被删除 [#5119](https://github.com/babel/babel/pull/5119) ![low](https://img.shields.io/badge/risk%20of%20breakage%3F-low-yellowgreen.svg)

TC39决定放弃这个提案。可以将相关逻辑移到构造函数或静态方法中去。

看 [/docs/plugins/transform-class-constructor-call/](/docs/plugins/transform-class-constructor-call/) 获取更多信息。

```对比
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

-  call constructor(x, y) {
+  static secondConstructor(x, y) {
      return new Point(x, y);
    }
  }

  let p1 = new Point(1, 2);
- let p2 = Point(3, 4);
+ let p2 = Point.secondConstructor(3, 4);
```

### `@babel/plugin-async-to-generator`

我们合并了`babel-plugin-transform-async-to-module-method`到了常规的异步插件,只需将其作为一个选项即可。

```对比
{
  "plugins": [
-    ["@babel/transform-async-to-module-method"]
+    ["@babel/transform-async-to-generator", {
+      "module": "bluebird",
+      "method": "coroutine"
+    }]
  ]
}
```

## `babel`

> 卸载 `babel` 包 [#5293](https://github.com/babel/babel/pull/5293) ![low](https://img.shields.io/badge/risk%20of%20breakage%3F-low-yellowgreen.svg)
>
该包当前会显示一条错误消息，提示您在Babel v6中安装`babel-cli`。
我想我们可以用这个名字做些有趣的事。
## `@babel/register`

> `babel-core/register.js` 已经被移除 [#5132](https://github.com/babel/babel/pull/5132) ![low](https://img.shields.io/badge/risk%20of%20breakage%3F-low-yellowgreen.svg)

`babel-core/register`的遗弃用法在babel 7中已被删除；而是使用独立的包 `@babel/register`。

安装 `@babel/register` 作为新的依赖:

```sh
npm install --save-dev @babel/register
```

用Mocha升级:

```对比
- mocha --require babel-core/register
+ mocha --require @babel/register
```

`@babel/register` 现在也只能直接编译当前工作中的文件（通过符号链接修复问题）。

`@babel/register` 选项现在被替换而不是合并。

## `@babel/generator`

> 遗弃 `quotes` 选项 [#5154](https://github.com/babel/babel/pull/5154)] ![none](https://img.shields.io/badge/risk%20of%20breakage%3F-none-brightgreen.svg)

如果您想格式化编译后的输出，可以使用recast/prettier/escodegen/fork-babel-generator。

直到v6.18.0公开了`parserOpts`和 `generatorOpts`之前，这个选项只能通过`babel-generator`显式地使用。因为那个版本中有一个bug，所以没有人应该在Babel本身中使用这个选项。

> 遗弃 `flowUsesCommas` 选项 [#5123](https://github.com/babel/babel/pull/5123) ![none](https://img.shields.io/badge/risk%20of%20breakage%3F-none-brightgreen.svg)

在Flow对象类型中，目前有两种受支持的语法（`,`和`;`）
这个变化只是使babel-generator输出`,`而不是`;`。

## `@babel/core`

> 移除 `babel-core/src/api/browser.js` [#5124](https://github.com/babel/babel/pull/5124) ![none](https://img.shields.io/badge/risk%20of%20breakage%3F-none-brightgreen.svg)

`babel-browser` 早在 6.0 版本就移除了。如果您需要在浏览器或非Node环境中使用Babel, 使用 [@babel/standalone](standalone.md).

Babel会返回 `filename` 作为绝对路径 [#8044](https://github.com/babel/babel/pull/8044)

## `@babel/preset-env`

`loose` 模式现在将自动排除 `typeof-symbol` 转换 (很多使用loos模式的项目都在这样做)。
