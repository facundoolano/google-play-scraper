'use strict';

const memoizee = require('memoizee');

function memoize (fn) {
  return memoizee(fn, {
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 60 * 12 // cache for 12 hours
  });
}

module.exports = memoize;
