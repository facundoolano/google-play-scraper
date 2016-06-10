'use strict';

const memoizee = require('memoizee');

function memoize (fn) {
  return memoizee(fn);
}

module.exports = memoize;
