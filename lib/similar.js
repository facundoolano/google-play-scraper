'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');

function similar (getParseList, opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.lang = opts.lang || 'en';
    const appId = encodeURIComponent(opts.appId);

    const options = Object.assign({
      url: `https://play.google.com/store/apps/similar?id=${appId}&hl=${opts.lang}`,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(cheerio.load)
      .then(getParseList(opts))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = similar;
