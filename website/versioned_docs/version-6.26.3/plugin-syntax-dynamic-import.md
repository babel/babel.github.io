---
id: version-6.26.3-babel-plugin-syntax-dynamic-import
title: babel-plugin-syntax-dynamic-import
sidebar_label: syntax-dynamic-import
original_id: babel-plugin-syntax-dynamic-import
---

`babel-plugin-syntax-dynamic-import` is needed to enable support for parsing `import()`

**Usage notes:**

1. If you are using `babel-preset-env`, it's automatically handled
2. If you are using Webpack or Rollup, you shouldn't transpile `import()` with Babel and let the bundler handle it for you
3. Otherwise, you need `babel-plugin-proposal-dynamic-import`

## Installation

```sh
npm install --save-dev babel-plugin-syntax-dynamic-import
```

## Usage

### With a configuration file (Recommended)

```json
{
  "plugins": ["syntax-dynamic-import"]
}
```

### Via CLI

```sh
babel --plugins syntax-dynamic-import script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["syntax-dynamic-import"]
});
```

