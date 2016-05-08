'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');

const h = require('./helpers');

function similar (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.lang = opts.lang || 'en';
    const appId = encodeURIComponent(opts.appId);
    const url = `https://play.google.com/store/apps/similar?id=${appId}&hl=${opts.lang}`;

    request(url)
      .then(cheerio.load, h.requestError)
      .then(h.getParseList(opts))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = similar;
