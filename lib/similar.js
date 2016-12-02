'use strict';

const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');

const getParseList = require('./utils/parseList');

function similar (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.lang = opts.lang || 'en';
    const appId = encodeURIComponent(opts.appId);

    const options = {
      url: `https://play.google.com/store/apps/similar?id=${appId}&hl=${opts.lang}`,
      proxy: opts.proxy
    };

    request(options, opts.throttle)
      .then(cheerio.load)
      .then(getParseList(opts))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = memoize(similar);
