// https://github.com/hughsk/flat/blob/master/index.js

function isBuffer(obj) {
  return (
    obj != null &&
    obj.constructor != null &&
    typeof obj.constructor.isBuffer === "function" &&
    obj.constructor.isBuffer(obj)
  );
}

function flatten(target, opts) {
  opts = opts || {};

  const delimiter = opts.delimiter || ".";
  const maxDepth = opts.maxDepth;
  const output = {};

  function step(object, prev, currentDepth) {
    currentDepth = currentDepth || 1;
    Object.keys(object).forEach(function(key) {
      const value = object[key];
      const isarray = opts.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isbuffer = isBuffer(value);
      const isobject = type === "[object Object]" || type === "[object Array]";
      const newKey = prev ? prev + delimiter + key : key;
      if (
        !isarray &&
        !isbuffer &&
        isobject &&
        Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)
      ) {
        return step(value, newKey, currentDepth + 1);
      }
      output[newKey] = value;
    });
  }

  step(target);

  return output;
}

function unflatten(target, opts) {
  opts = opts || {};

  const delimiter = opts.delimiter || ".";
  const overwrite = opts.overwrite || false;
  const result = {};
  const isbuffer = isBuffer(target);
  if (
    isbuffer ||
    Object.prototype.toString.call(target) !== "[object Object]"
  ) {
    return target;
  }

  // safely ensure that the key is
  // an integer.
  function getkey(key) {
    const parsedKey = Number(key);

    return isNaN(parsedKey) || key.indexOf(".") !== -1 || opts.object
      ? key
      : parsedKey;
  }

  const sortedKeys = Object.keys(target).sort(function(keyA, keyB) {
    return keyA.length - keyB.length;
  });

  sortedKeys.forEach(function(key) {
    const split = key.split(delimiter);
    let key1 = getkey(split.shift());
    let key2 = getkey(split[0]);
    let recipient = result;

    while (key2 !== undefined) {
      const type = Object.prototype.toString.call(recipient[key1]);
      const isobject = type === "[object Object]" || type === "[object Array]";

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== "undefined") {
        return;
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = typeof key2 === "number" && !opts.object ? [] : {};
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts);
  });

  return result;
}

function filterFlatten(flattenSrc, type) {
  const result = Object.keys(flattenSrc)
    .filter(key => {
      const keys = key.split(".");
      return keys.includes(type);
    })
    .reduce((object, key) => {
      object[key] = flattenSrc[key];
      return object;
    }, {});
  return result;
}

function deleteFlatten(currentSrc, deletedSrc) {
  const deletedKeys = Object.keys(deletedSrc);
  const result = Object.keys(currentSrc).reduce((object, key) => {
    !deletedKeys.includes(key) ? (object[key] = currentSrc[key]) : null;
    return object;
  }, {});
  return result;
}

function mergeFlatten(currentSrc, nextSrc) {
  return {
    ...currentSrc,
    ...nextSrc,
  };
}

export { flatten, unflatten, filterFlatten, deleteFlatten, mergeFlatten };