'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');

const h = require('./helpers');

function developer (opts) {
  return new Promise(function (resolve, reject) {
    opts = opts || {};
    validate(opts);

    const devId = encodeURIComponent(opts.devId);
    const url = `https://play.google.com/store/apps/developer?id=${devId}&hl=${opts.lang}&num=${opts.num}`;

    request(url)
      .then(cheerio.load, h.requestError)
      .then(h.getParseList(opts))
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
}

module.exports = developer;
