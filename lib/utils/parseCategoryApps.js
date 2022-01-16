'use strict';

const debug = require('debug')('google-play-scraper:parseCategoryApps');
const request = require('./request');
const R = require('ramda');
const scriptData = require('./scriptData');
const { INITIAL_MAPPINGS } = require('../mappers/apps');
const clusters = require('../mappers/clusters');
const { processAndRecur } = require('../requesters/appsMappedRequests');
const { BASE_URL } = require('./configurations');

/**
 * Get the cluster url for a given collection
 * A cluster is the URL contained in the button "See More"
 * of each category collection
 * @param {Object} categoryObject
 * @param {String} collection
 */
function getParsedCluster (categoryObject, collection) {
  // This mapping reflects all the collections of a given type (new / top) and category
  // For example the URL https://play.google.com/store/apps/top?hl=en
  // gives you the "Top Free Apps", "Top Paid Apps" and so on
  const allCollections = R.path(INITIAL_MAPPINGS.collections, categoryObject);
  debug('allCollections: %o', allCollections);
  if (!allCollections) {
    throw Error(`The collection ${collection} have no clusters`);
  }

  const collectionPosition = clusters.POSITIONS[collection];
  debug('selectedCollection: %o', collectionPosition);

  if (typeof collectionPosition === 'undefined') {
    throw Error(`The collection ${collection} is invalid for the given category, top apps or new apps`);
  }

  return R.path([collectionPosition, ...clusters.URL], allCollections);
}

function parseCategoryApps (categoryObject, opts) {
  const { collection } = opts;
  const clusterUrl = getParsedCluster(categoryObject, collection);

  if (!clusterUrl) {
    return [];
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

module.exports = parseCategoryApps;
