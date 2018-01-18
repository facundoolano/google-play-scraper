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

    const options = {
      url: `https://play.google.com/store/apps/similar?id=${appId}`,
      proxy: opts.proxy,
      followRedirect: false // Don't follow redirects, because we need to add lang param to it
    };

    request(options, opts.throttle)
      .then(response => {
        if (response.statusCode > 300 && response.headers && response.headers.location) {
          const redirectOpts = {
            url: `${response.headers.location}&hl=${opts.lang}`,
            proxy: opts.proxy
          };
          return request(redirectOpts, opts.throttle);
        }
        return response;
      })
      .then(cheerio.load)
      .then(getParseList(opts))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = similar;
