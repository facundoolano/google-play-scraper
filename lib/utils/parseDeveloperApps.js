'use strict';

const debug = require('debug')('google-play-scraper:parseDeveloperApps');
const request = require('./request');
const R = require('ramda');
const scriptData = require('./scriptData');
const { processAndRecur } = require('../requesters/appsMappedRequests');
const { BASE_URL } = require('./configurations');
const { INITIAL_MAPPINGS } = require('../mappers/developer');

function getParsedCluster (developerObject) {
  const clusterUrl = R.path(INITIAL_MAPPINGS.cluster, developerObject);
  return clusterUrl;
}

function parseDeveloperApps (developerObject, opts) {
  const clusterUrl = opts.hasClusterUrl
    ? getParsedCluster(developerObject)
    : undefined;

  if (!clusterUrl) {
    return processAndRecur(developerObject, opts, [], INITIAL_MAPPINGS);
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
    .then(clusterObject => processAndRecur(clusterObject, opts, [], INITIAL_MAPPINGS))
    .catch(console.error);
}

module.exports = parseDeveloperApps;
