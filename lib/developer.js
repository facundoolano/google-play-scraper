'use strict';

const debug = require('debug')('google-play-scraper:developer');
const qs = require('querystring');
const scriptData = require('./utils/scriptData');
const { BASE_URL } = require('./constants');
const request = require('./utils/request');
const R = require('ramda');
const processPages = require('./utils/processPages');

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

const INITIAL_MAPPINGS = {
  cluster: ['ds:3', 0, 1, 0, 0, 3, 4, 2],
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1]
};

function parseDeveloperApps (developerObject, opts) {
  const clusterUrl = opts.hasClusterUrl
    ? getParsedCluster(developerObject)
    : undefined;

  if (!clusterUrl) {
    return processPages(developerObject, opts, [], INITIAL_MAPPINGS);
  }

  const clusterUrlToProcess = `${BASE_URL}${clusterUrl}&hl=${opts.lang}&gl=${opts.country}`;

  debug('Cluster Request URL: %s', clusterUrlToProcess);

  const options = Object.assign({
    url: clusterUrlToProcess,
    method: 'GET',
    followRedirect: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then(clusterObject => processPages(clusterObject, opts, [], INITIAL_MAPPINGS))
    .catch(console.error);
}

function getParsedCluster (developerObject) {
  const clusterUrl = R.path(INITIAL_MAPPINGS.cluster, developerObject);
  return clusterUrl;
}

module.exports = developer;
