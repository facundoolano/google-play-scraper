'use strict';

const request = require('./utils/request');
const queryString = require('querystring');
const scriptData = require('./utils/scriptData');
const mapping = require('./utils/appListMapping');

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details';

function similar (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.appId = encodeURIComponent(opts.appId);
    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';

    const qs = queryString.stringify({
      id: opts.appId,
      hl: opts.lang,
      gl: opts.country
    });
    const reqUrl = `${PLAYSTORE_URL}?${qs}`;

    const options = Object.assign({
      url: reqUrl,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(scriptData.extractor(PATH))
      .then(data => {
        if (data.path === undefined) {
          throw Error('not found similar link');
        }
        return request(Object.assign({
          url: `https://play.google.com${data.path}&gl=${opts.country}&hl=${opts.lang}`,
          followAllRedirects: true
        }, opts.requestOptions));
      })
      .then(scriptData.parse)
      .then(mapping.processList)
      .then(resolve)
      .catch(reject);
  });
}

const PATH = {
  path: ['ds:6', 1, 1, 0, 0, 3, 4, 2]
};

module.exports = similar;
