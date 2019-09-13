'use strict';

const R = require('ramda');
const c = require('./constants');
const { processFullReviews } = require('./requesters/reviewsMappedRequests');

function reviews (opts) {
  return new Promise(function (resolve, reject) {
    opts = R.clone(opts || {});
    validate(opts);

    processFullReviews(opts)
      .then(resolve)
      .catch(reject);
  });
}

function validate (opts) {
  if (!opts || !opts.appId) {
    throw Error('appId missing');
  }

  if (opts.sort && !R.contains(opts.sort, R.values(c.sort))) {
    throw new Error('Invalid sort ' + opts.sort);
  }

  opts.sort = opts.sort || c.sort.NEWEST;
  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';
  opts.num = opts.num || 100;
}

module.exports = reviews;
