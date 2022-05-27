'use strict';

const R = require('ramda');
const queryString = require('querystring');
const request = require('./utils/request');
const scriptData = require('./utils/scriptData');
const mappingV1 = require('./mapping/app/general.v1');
const mappingV2 = require('./mapping/app/general.v2');

const { BASE_URL } = require('./constants');

const PLAYSTORE_URL = `${BASE_URL}/store/apps/details`;

function app (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

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
      followRedirect: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
    // comment next line to get raw data
      .then((parsedData) => {
        const isV2 = typeof R.path(mappingV1.title[0], parsedData) !== 'string';
        const mapping = isV2 ? mappingV2 : mappingV1;

        return scriptData.extractor(mapping)(parsedData);
      })
      .then(R.assoc('appId', opts.appId))
      .then(R.assoc('url', reqUrl))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = app;
