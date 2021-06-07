---
title: Compiler assumptions
id: assumptions
---

<script defer src="/js/babel.min.js"></script>
<script type="module" src="/js/components/mini-repl.js"></script>
<script type="module" src="/js/components/assumption-repl.js"></script>

<style>
.assumption-input {
  display: none;
}
</style>

By default Babel tries to compile your code so that it matches the native behavior as closely as possible. However, this sometimes means generating more output code, or slower output code, just to support some edge cases you don't care about.

Since Babel 7.13.0, you can specify an `assumptions` option in your configuration to tell Babel which assumptions it can make about your code, to better optimize the compilation result. *Note*: this replaces the various `loose` options in plugins in favor of top-level options that can apply to multiple plugins ([RFC link](https://github.com/babel/rfcs/blob/master/rfcs/0003-top-level-assumptions.md)). 

For example:

```json
{
  "targets": ">0.5%",
  "assumptions": {
    "noDocumentAll": true,
    "noClassCalls": true
  },
  "presets": ["@babel/preset-env"]
}
```

> ⚠ This is advanced functionality. Please be careful when enabling assumptions, because they are not spec-compliant and may break your code in unexpected ways.

## `arrayLikeIsIterable`

When spreading or iterating an array-like object, assume that it implements a `[Symbol.iterator]` method with the same behavior of the native `Array.prototype[Symbol.iterator]`, and thus directly iterate over its element by index.

This can be useful, for example, to iterate DOM collections in older browsers.

<div is="assumption-repl" data-assumption="arrayLikeIsIterable" data-plugins="transform-destructuring,transform-spread,transform-for-of">

```text assumption-input
let images = $("img");

for (const img of images) {
  console.log(img);
}

const copy = [...images];
```
</div>

## `constantReexports`

When re-exporting a binding from a module, assume that it doesn't change and thus it's safe to directly export it, as if you were doing

```js
import { value as val } from "dep";

export const value = val;
```

*NOTE:* This also affects the `transform-modules-umd` and `transform-modules-amd` plugins.

<div is="assumption-repl" data-assumption="constantReexports" data-plugins="transform-modules-commonjs">

```text assumption-input
export { value } from "dependency";
```

</div>

## `constantSuper`

The super class of a class can be changed at any time by using `Object.setPrototypeOf`, making it impossible for Babel to statically know it. When this option is enabled, Babel assumes that it's never changed and thus it is always the value that was placed in the `extends` clause in the class declaration.

<div is="assumption-repl" data-assumption="constantSuper" data-plugins="transform-classes">

```text assumption-input
class Child extends Base {
  method() {
    super.method(2);
  }
}
```

</div>

## `enumerableModuleMeta`

When compiling ESM to CJS, Babel defines a `__esModule` property on the `module.exports` object. Assume that you never iterate over the keys of `module.exports` or of `require("your-module")` using `for..in` or `Object.keys`, and thus it's safe to define `__esModule` as enumerable.

<div is="assumption-repl" data-assumption="enumerableModuleMeta" data-plugins="transform-modules-commonjs">

```text assumption-input
export const number = 2;
```

</div>

## `ignoreFunctionLength`

Functions have a `.length` property that reflect the number of parameters up to the last non-default parameter. When this option is enabled, assume that the compiled code does not rely on this `.length` property.

<div is="assumption-repl" data-assumption="ignoreFunctionLength" data-plugins="transform-parameters">

```text assumption-input
function fn(a, b = 2, c, d = 3) {
  return a + b + c + d;
}
```

</div>

## `ignoreToPrimitiveHint`

When using language features that might call the [`[Symbol.toPrimitive]`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) method of objects, assume that they don't change their behavior based on the `hint` parameter.

<div is="assumption-repl" data-assumption="ignoreToPrimitiveHint" data-plugins="transform-template-literals">

```text assumption-input
let str = `a${foo}b`;
```

</div>

## `iterableIsArray`

When using an iterable object (in array destructuring, for-of or spreads), assume that it is an array.

<div is="assumption-repl" data-assumption="iterableIsArray" data-plugins="transform-for-of,transform-destructuring,transform-spread">

```text assumption-input
const [first, ...rest] = obj;

call(first, ...obj);
let arr = [first, ...obj];

for (const el of obj) {
  console.log(el);
}
```

</div>

## `mutableTemplateObject`

Don't use `Object.freeze` for the template object created for tagged template literals. This effectively means using the `taggedTemplateLiteralLoose` helper instead of `taggedTemplateLiteral`.

<div is="assumption-repl" data-assumption="mutableTemplateObject" data-plugins="transform-template-literals">

```text assumption-input
let str = tag`a`;
```

</div>

## `noClassCalls`

When transforming classes, assume that they are always instantiate with `new` and they are never called as functions.

<div is="assumption-repl" data-assumption="noClassCalls" data-plugins="transform-classes">

```text assumption-input
class Test {
  constructor() {
    this.x = 2;
  }
}
```

</div>

## `noDocumentAll`

When using operators that check for `null` or `undefined`, assume that they are never used with the special value `document.all`.

<div is="assumption-repl" data-assumption="noDocumentAll" data-plugins="proposal-optional-chaining,proposal-nullish-coalescing-operator">

```text assumption-input
let score = points ?? 0;
let name = user?.name;
```

</div>

## `noIncompleteNsImportDetection`

Assume that no own property of a module export object is observed before initialization.
For example, when trying to access `ns.foo`, it will return `undefined` both with this assumption turned on or off. The
difference is that `Object.prototype.hasOwnProperty.call(ns, "foo")` would return `false` when 
`noIncompleteNsImportDetection: true`.

<div is="assumption-repl" data-assumption="noIncompleteNsImportDetection" data-plugins="plugin-transform-modules-commonjs">

```text assumption-input
export var foo;
```

</div>

## `noNewArrows`

Assume that the code never tries to instantiate arrow functions using `new`, which is disallowed according to the specification.

*NOTE:* This assumption defaults to `true`. It will default to `false` starting from Babel 8.

<div is="assumption-repl" data-assumption="noNewArrows" data-plugins="transform-arrow-functions">

```text assumption-input
let getSum = (a, b) => {
  return { sum: a + b }
};
```

</div>

## `objectRestNoSymbols`

When using rest patterns in object destructuring, assume that destructured objects don't have symbol keys or that it's not a problem if they are not copied.

<div is="assumption-repl" data-assumption="objectRestNoSymbols" data-plugins="transform-destructuring,proposal-object-rest-spread">

```text assumption-input
let { name, ...attrs } = obj;
```

</div>

## `privateFieldsAsProperties`

Assume that "soft privacy" is enough for private fields, and thus they can be stored as public non-enumerable properties with an unique name (rather than using an external `WeakMap`). This makes debugging compiled private fields easier.

<div is="assumption-repl" data-assumption="privateFieldsAsProperties" data-plugins="proposal-class-properties,proposal-private-methods">

```text assumption-input
class Foo {
  #method() {}

  #field = 2;

  run() {
    this.#method();
    this.#field++;
  }
}
```

</div>

## `pureGetters`

Assume that getters, if present, don't have side-effects and can be accessed multiple times.

<div is="assumption-repl" data-assumption="pureGetters" data-plugins="proposal-optional-chaining">

```text assumption-input
let a = obj;

a.b?.();
```

</div>

## `setClassMethods`

When declaring classess, assume that methods don't shadow getters on the superclass and that the program doesn't depend on methods being non-enumerable. Thus, it's safe to assign methods rather than using `Object.defineProperty`.

<div is="assumption-repl" data-assumption="setClassMethods" data-plugins="transform-classes">

```text assumption-input
class Foo extends Bar {
  method() {}

  static check() {}
}
```

</div>

## `setComputedProperties`

When using computed object properties, assume that the object doesn't contain properties that overwrite setter defined in the same object, and thus it's safe to assign them rather than defining them using `Object.defineProperty`.

<div is="assumption-repl" data-assumption="setComputedProperties" data-plugins="transform-computed-properties">

```text assumption-input
let obj = {
  set name(value) {},
  [key]: val
}
```

</div>

## `setPublicClassFields`

When using public class fields, assume that they don't shadow any getter in the current class, in its subclasses or in its superclass. Thus, it's safe to assign them rather than using `Object.defineProperty`.

<div is="assumption-repl" data-assumption="setPublicClassFields" data-plugins="proposal-class-properties">

```text assumption-input
class Test {
  field = 2;

  static staticField = 3;
}
```

</div>

## `setSpreadProperties`

When using object spread, assume that spreaded properties don't trigger getters on the target object and thus it's safe to assign them rather than defining them using `Object.defineProperty`.

<div is="assumption-repl" data-assumption="setSpreadProperties" data-plugins="proposal-object-rest-spread">

```text assumption-input
const result = {
  set name(value) {},
  ...obj,
};
```

</div>

## `skipForOfIteratorClosing`

When using `for-of` with an iterator, it should always be closed with `.return()` and with `.throw()` in case of an error. When this option is called Babel assumes that those methods are not defined or empty, and it avoids calling them.

<div is="assumption-repl" data-assumption="skipForOfIteratorClosing" data-plugins="transform-for-of">

```text assumption-input
for (const val of iterable) {
  console.log(val);
}
```

</div>

## `superIsCallableConstructor`

When extending classes, assume that the super class is callable. This means that it won't be possible to extend native classes or built-ins, but only compiled classes or ES5 `function` constructors.

<div is="assumption-repl" data-assumption="superIsCallableConstructor" data-plugins="transform-classes">

```text assumption-input
class Child extends Parent {
  constructor() {
    super(42);
  }
}
```

</div>
