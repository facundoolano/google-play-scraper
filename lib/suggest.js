'use strict';

const request = require('./utils/request');
const memoize = require('./utils/memoize');
const R = require('ramda');

function suggest (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts && !opts.term) {
      throw Error('term missing');
    }

    const term = encodeURIComponent(opts.term);
    const options = {
      url: `https://market.android.com/suggest/SuggRequest?json=1&c=3&query=${term}`,
      json: true,
      proxy: opts.proxy
    };

    request(options, opts.throttle)
      .then(function (res) {
        const suggestions = R.pluck('s', res);
        resolve(suggestions);
      })
      .catch(reject);
  });
}

module.exports = memoize(suggest);
