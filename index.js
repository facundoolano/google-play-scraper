'use strict';

const c = require('./lib/constants');
const R = require('ramda');
const memoizee = require('memoizee');

const constants = {
  category: c.category,
  collection: c.collection,
  sort: c.sort,
  age: c.age
};

const methods = {
  app: require('./lib/app'),
  list: require('./lib/list'),
  search: require('./lib/search'),
  suggest: require('./lib/suggest'),
  developer: require('./lib/developer'),
  reviews: require('./lib/reviews'),
  similar: require('./lib/similar'),
  permissions: require('./lib/permissions')
};

function memoized (opts) {
  const cacheOpts = Object.assign({
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 5, // cache for 5 minutes
    max: 1000 // save up to 1k results to avoid memory issues
  }, opts);
  const doMemoize = (fn) => memoizee(fn, cacheOpts);
  return Object.assign({}, constants, R.map(doMemoize, methods));
}

module.exports = Object.assign({memoized}, constants, methods);
