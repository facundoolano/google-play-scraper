'use strict';

var request = require('./utils/request');
var R = require('ramda');

function suggest(opts) {
  return new Promise(function (resolve, reject) {
    if (!opts && !opts.term) {
      throw Error('term missing');
    }

    var lang = opts.lang || 'en';
    var country = opts.country || 'us';

    var term = encodeURIComponent(opts.term);
    var options = Object.assign({
      url: 'https://market.android.com/suggest/SuggRequest?json=1&c=3&query=' + term + '&hl=' + lang + '&gl=' + country,
      json: true,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle).then(function (res) {
      var suggestions = R.pluck('s', res);
      resolve(suggestions);
    }).catch(reject);
  });
}

module.exports = suggest;