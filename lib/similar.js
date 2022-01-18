'use strict';

const R = require('ramda');
const debug = require('debug')('google-play-scraper:similar');
const request = require('./utils/request');
const queryString = require('querystring');
const scriptData = require('./utils/scriptData');
const { BASE_URL } = require('./constants');
const processPages = require('./utils/processPages');

function similar (opts) {
  return new Promise(function (resolve, reject) {
    validateSimilarParameters(opts);

    const mergedOpts = Object.assign({},
      {
        appId: encodeURIComponent(opts.appId),
        lang: opts.lang || 'en',
        country: opts.country || 'us',
        fullDetail: opts.fullDetail
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

const INITIAL_MAPPINGS = {
  cluster: ['ds:7', 1, 1, 0, 0, 3, 4, 2],
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1]
};

function parseSimilarApps (similarObject, opts) {
  const clusterUrl = getParsedCluster(similarObject);

  if (clusterUrl === undefined) {
    throw Error('Similar link not found');
  }

  const fullClusterUrl = `${BASE_URL}${clusterUrl}&gl=${opts.country}&hl=${opts.lang}`;
  debug('Cluster Request URL: %s', fullClusterUrl);

  const options = Object.assign({
    url: fullClusterUrl,
    followRedirect: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then((htmlParsed) => processPages(htmlParsed, opts, [], INITIAL_MAPPINGS));
}

function getParsedCluster (similarObject) {
  const clusterUrl = R.path(INITIAL_MAPPINGS.cluster, similarObject);
  return clusterUrl;
}

module.exports = similar;
