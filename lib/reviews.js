'use strict';

const R = require('ramda');
const c = require('./constants');
const { processReviews } = require('./requesters/reviewsMappedRequests');

function reviews (opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);
    const fullOptions = Object.assign({
      sort: c.sort.NEWEST,
      lang: 'en',
      country: 'us',
      num: 150,
      paginate: false,
      nextPaginationToken: null
    }, opts);

    processReviews(fullOptions)
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
}

module.exports = reviews;
