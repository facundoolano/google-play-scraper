'use strict';

const debug = require('debug')('google-play-scraper:similar');
const request = require('./utils/request');
const queryString = require('querystring');
const scriptData = require('./utils/scriptData');
const { BASE_URL, DEFAULT_PARAMETERS } = require('./utils/configurations');
const parseSimilarApps = require('./parsers/parseSimilarApps');

function similar (opts) {
  return new Promise(function (resolve, reject) {
    validateSimilarParameters(opts);

    const mergedOpts = Object.assign({},
      {
        appId: encodeURIComponent(opts.appId),
        lang: opts.lang || DEFAULT_PARAMETERS.similar.lang,
        country: opts.country || DEFAULT_PARAMETERS.similar.country,
        fullDetail: opts.fullDetail || DEFAULT_PARAMETERS.similar.fullDetail
      });

    const qs = queryString.stringify({
      id: mergedOpts.appId,
      hl: mergedOpts.lang,
      gl: mergedOpts.country
    });

    const similarUrl = `${BASE_URL}/store/apps/details?${qs}`;
    const options = Object.assign({
      url: similarUrl,
      followRedirect: true
    }, opts.requestOptions);

    debug('Similar Request URL: %s', similarUrl);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseSimilarApps(parsedObject, mergedOpts))
      .then(resolve)
      .catch(reject);
  });
}

function validateSimilarParameters (opts) {
  if (!opts || !opts.appId) {
    throw Error('appId missing');
  }
}

module.exports = similar;
