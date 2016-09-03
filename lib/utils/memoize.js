'use strict';

const memoizee = require('memoizee');

function memoize (fn) {
  const memoized = memoizee(fn, {
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 60 * 12, // cache for 12 hours
    max: 1000 // save up to 1k results to avoid memory issues
  });

  return function (opts) {
    if (opts.cache !== false) {
      return memoized(opts);
    }
    return fn(opts);
  };
}

module.exports = memoize;
