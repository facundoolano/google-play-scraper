'use strict';

const request = require('request-promise');
const R = require('ramda');

function suggest (term) {
  return new Promise(function (resolve, reject) {
    if (!term) {
      throw Error('term missing');
    }

    term = encodeURIComponent(term);
    const url = `https://market.android.com/suggest/SuggRequest?json=1&c=3&query=${term}`;
    request({
      url: url,
      json: true
    })
    .then(function (res) {
      const suggestions = R.pluck('s', res);
      resolve(suggestions);
    })
    .catch(reject);
  });
}

module.exports = suggest;
