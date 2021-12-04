'use strict';

const debug = require('debug')('google-play-scraper:developer');
const qs = require('querystring');
const scriptData = require('./utils/scriptData');
const parseDeveloperApps = require('./utils/parseDeveloperApps');
const { BASE_URL } = require('./utils/configurations');
const request = require('./utils/request');

function buildUrl (opts) {
  const { lang, devId, country } = opts;
  const url = `${BASE_URL}/store/apps`;
  const path = isNaN(opts.devId)
    ? `/developer`
    : `/dev`;

  const queryString = {
    id: devId,
    hl: lang,
    gl: country
  };

  const fullURL = `${url}${path}?${qs.stringify(queryString)}`;

  debug('Initial request: %s', fullURL);

  return fullURL;
}

function developer (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts.devId) {
      throw Error('devId missing');
    }

    opts = Object.assign({
      num: 60,
      lang: 'en',
      country: 'us'
    }, opts);

    const options = Object.assign({
      url: buildUrl(opts),
      method: 'GET',
      followRedirect: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseDeveloperApps(parsedObject, opts))
      .then(resolve)
      .catch(reject);
  });
}

module.exports = developer;
