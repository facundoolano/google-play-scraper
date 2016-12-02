'use strict';

const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');

const getParseList = require('./utils/parseList');

function developer (opts) {
  return new Promise(function (resolve, reject) {
    opts = opts || {};
    validate(opts);

    const devId = encodeURIComponent(opts.devId);
    const url = `https://play.google.com/store/apps/developer?id=${devId}&hl=${opts.lang}&gl=${opts.country}&num=${opts.num}`;

    const options = {
      url: url,
      proxy: opts.proxy
    };

    request(options, opts.throttle)
      .then(cheerio.load)
      .then(getParseList(opts))
      .then(resolve)
      .catch(reject);
  });
}

function validate (opts) {
  if (!opts.devId) {
    throw Error('devId missing');
  }

  opts.num = opts.num || 60;
  if (opts.num > 120) {
    throw Error('Cannot retrieve more than 120 apps at a time');
  }

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';
}

module.exports = memoize(developer);
