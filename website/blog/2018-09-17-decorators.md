---
layout: post
title:  "TC39 Standards-track Decorators in Babel"
author: Nicolò Ribaudo
authorURL: https://twitter.com/NicoloRibaudo
date:   2018-09-17 12:00:00
categories: announcements
share_text: "TC39 Standards-track Decorators in Babel"
---

Babel 7.1.0 finally supports the new decorators proposal: you can try it out by using the `@babel/plugin-proposal-decorators` plugin 🎉.

<!--truncate-->

## A bit of history

Decorators were [first proposed](https://github.com/wycats/javascript-decorators/blob/696232bbd997618d603d6577848d635872f25c43/README.md) by [Yehuda Kats](https://github.com/wycats) more than three years ago. TypeScript released support for decorators in [version 1.5](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#typescript-15) (2015) alongside with many ES6 features: modules, destructuring, `let`/`const`, `for ... of` and computed properties.
Some major frameworks, like Angular and MobX, started using them to enhance their developer experience: this made decorators popular and gave the community a false sense of stability.

Babel first implemented decorators in [version 5](https://github.com/babel/babel/blob/master/.github/CHANGELOG-v5.md#500), but they had been removed in Babel 6 because the proposal was still in flux. Logan Smyth created an unofficial plugin ([`babel-plugin-transform-decorators-legacy`](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)) which replicated the Babel 5 behavior; it has then been moved to the official Babel repository during the first Babel 7 alpha release. This plugin still used the old decorators semantics, because it wasn't clear yet what the new proposal would have been.

Since then, [Daniel Ehrenberg](https://github.com/littledan) and [Brian Terlson](https://github.com/bterlson) become co-authors of the proposal along with [Yehuda Katz](https://github.com/wycats), it has been almost completely rewritten. Not everything has been decided yet, and there isn't a compliant implementation as of today.

Babel 7.0.0 introduced a new flag to the `@babel/plugin-proposal-decorators` plugin: the `legacy` option, whose only valid value was `true`. This breaking change was needed to provide a smooth transition path from the stage 1 version of the proposal to the current one.
In Babel 7.1.0 we are introducing support for this new proposal, and it is enabled by default when using the `@babel/plugin-proposal-decorators` plugin. If we didn't introduce the `legacy: true` option in Babel 7.0.0, it wouldn't be possible to use the correct semantics by default (which would be equivalent to `legacy: false`).
This new proposal also supports decorators on private fields and methods. We haven't implemented this feature yet in Babel (for each class, you can use either decorators or private elements), but it will come very soon.

## What changed in the new proposal?

Even though the new proposal looks very similar to the old one, there are several important differences that make them incompatible.

### Syntax

The old proposal allowed any valid left-hand side expression to be used as the body of a decorator. For example, this was valid code:

```javascript=
class MyClass {
  @getDecorators().methods[name]
  foo() {}

  @decorator
  [bar]() {}
}
```

That syntax had a problem: the `[...]` notation was used both as property access inside the decorator body and to define computed names. To prevent such ambiguity, the new proposal only allows dot property access (`foo.bar`), optionally with arguments at the end (`foo.bar()`). If you need more complex expressions, you can wrap them in parentheses:

```javascript=
class MyClass {
  @decorator
  @dec(arg1, arg2)
  @namespace.decorator
  @(complex ? dec1 : dec2)
  method() {}
}
```

### Object decorators

The old version of the proposal allowed, in addition to class and class elements decorators, object members decorators:

```javascript=
const myObj = {
  @dec1 foo: 3,
  @dec2 bar() {},
};
```

Due to some incompatibilities with the current object literal semantics, they have been removed from the proposal. If you are using them in your code, stay tuned because they might be re-introduced in a follow-on proposal ([tc39/proposal-decorators#119](https://github.com/tc39/proposal-decorators/issues/119)).

### Decorator functions arguments

The third important change introduced by the new proposal is about the arguments passed to the decorator functions.

In the first version of the proposal, class elements decorators received the  target class (or object), the key and a property descriptor — similarly to what you would pass to `Object.defineProperty`. Class decorators took as their only argument the target constructor.

The new decorators proposal is much more powerful: element decorators take an object which, other than changing the property descriptor, allows to change the key, the placement (`static`, `prototype` or `own`) and the kind (`field` or `method`) of the element. They can also create additional properties and define a function (a *finisher*) which is run on the decorated class.
Class decorators take an object which contains the descriptors of every single class element, making it possible to modify them before creating the class.

## Open questions

Not everything has been decided yet: decorators are a very big feature and defining them in the best possible way is hard.

### Where should decorators on exported classes go?
> [tc39/proposal-decorators#69](https://github.com/tc39/proposal-decorators/issues/69)

The decorator proposal has gone back and forth on this question: should decorators come before or after the export keyword?

```javascript=
export @decorator class MyClass {}

// or

@decorator
export class MyClass {}
```

The underlying question is whether or not the `export` keyword is part of the class declaration or it is a "wrapper". In the first case it should come *after* decorators, since decorators come at the beginning of the declaration; in the second one it should come *before*, because decorators are part of the class declaration.

### How to make decorators securely interact with private elements?
> [tc39/proposal-decorators#129](https://github.com/tc39/proposal-decorators/issues/129), [tc39/proposal-decorators#133](https://github.com/tc39/proposal-decorators/issues/133)

Decorators give rise to an important security concern: if it is possible to decorate private elements, then private names (which can be considered as the "keys" of private elements) could be leaked. There are different safety levels to be thought of:
  1) Decorators should not accidentally leak private names. Malicious code should not be able to "steal" private names from other decorators, in any way.
  2) Only decorators directly applied to private elements might be considered trusted: should class decorators not be able to read and write private elements?
  3) *Hard privacy* (one of the goals of the class fields proposal) means that private elements should only be accessible from inside the class: should any decorator have access to private names? Should it be only possible to decorate public elements?

These questions need further discussion before being resolved, and that's where Babel comes in.

## The role of Babel

Following the trend in the «[What's Happening With the Pipeline (|>) Proposal?](http://babeljs.io/blog/2018/07/19/whats-happening-with-the-pipeline-proposal)» article, with the Babel 7 release we are starting to use our position in the JS ecosystem to help proposal authors even more, by giving developers the ability to test and give feedback about different variations of the proposals.

For this reason, alongside with the update of `@babel/plugin-proposal-decorators` we introduced a new option: `decoratorsBeforeExport`, which allows users to try both `export @decorator class C {}` and `@decorator export default class`. We will also introduce an option to customize the privacy constraint of decorated private elements. These options will be required until TC39 folks make a decision about them, so that we can let the default behavior be whatever the final proposal will specify.

If you are directly using our parser ([`@babel/parser`](https://babeljs.io/docs/en/next/babel-parser.html), formerly `babylon`) you can already use the `decoratorsBeforeExport` option in version 7.0.0:

```javascript=
const ast = babylon.parse(code, {
  plugins: [
    ["decorators", { decoratorsBeforeExport: true }]
  ]
})
```

## Your role

As a JavaScript developer, you can help outline the future of the language. You can test the various semantics which are being considered for decorators, and give feedback to the proposal authors. We need to know how you are using them in real-life projects!
You can also find out why some design decisions were taken by reading the discussions in the issues and the meeting notes in the [proposal's repository](https://github.com/tc39/proposal-decorators).

If you want to try out decorators right now, you can play with the different presets options in our [repl](https://babeljs.io/repl/build/master)!