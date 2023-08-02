import { map, partial } from 'ramda';
import { c } from './lib/constants.js';
import memoizee from 'memoizee';
import appMethod from './lib/app.js';

import list from './lib/list.js';
import search from './lib/search.js';
import suggest from './lib/suggest.js';
import developer from './lib/developer.js';
import reviews from './lib/reviews.js';
import similar from './lib/similar.js';
import permissions from './lib/permissions.js';
import datasafety from './lib/datasafety.js';
import categories from './lib/categories.js';

const methods = {
  app: appMethod,
  list: list,
  search: partial(search, [appMethod]),
  suggest: suggest,
  developer: developer,
  reviews: reviews,
  similar: similar,
  permissions: permissions,
  datasafety: datasafety,
  categories: categories
};

function memoized (opts) {
  const cacheOpts = Object.assign({
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 5, // cache for 5 minutes
    max: 1000 // save up to 1k results to avoid memory issues
  }, opts);

  // need to rebuild the methods so they all share the same memoized appMethod
  const doMemoize = (fn) => memoizee(fn, cacheOpts);
  const mAppMethod = memoizee(appMethod, cacheOpts);

  const otherMethods = {
    list: list,
    search: partial(search, [mAppMethod]),
    suggest: suggest,
    developer: developer,
    reviews: reviews,
    similar: similar,
    permissions: permissions,
    datasafety: datasafety,
    categories: categories
  };

  return Object.assign({ app: mAppMethod },
    c,
    map(doMemoize, otherMethods));
}

export default Object.assign({ memoized }, c, methods);
