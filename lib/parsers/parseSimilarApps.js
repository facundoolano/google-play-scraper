'use strict';

const R = require('ramda');
const debug = require('debug')('google-play-scraper:parseSimilarApps');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const { BASE_URL } = require('../utils/configurations');
const { processAndRecur } = require('../requesters/appsMappedRequests');
const { INITIAL_MAPPINGS } = require('../mappers/similar');

function getParsedCluster (similarObject) {
  const clusterUrl = R.path(INITIAL_MAPPINGS.cluster, similarObject);
  return clusterUrl;
}

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
    .then((htmlParsed) => processAndRecur(htmlParsed, opts, [], INITIAL_MAPPINGS));
}

module.exports = parseSimilarApps;
