'use strict';

const debug = require('debug')('google-play-scraper:parseCategoryApps');
const request = require('./request');
const c = require('../constants');
const R = require('ramda');
const scriptData = require('./scriptData');
const { INITIAL_MAPPINGS } = require('../mappers/request');
const { processAndRecur } = require('./dsMappedRequests');
const { BASE_URL } = require('./configurations');

function getParsedCluster (categoryObject, { category, collection }) {
  const collections = {
    2: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.TOP_PAID]: 1
    },
    3: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.TOP_PAID]: 1,
      [c.collection.GROSSING]: 2
    },
    4: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.GROSSING]: 1,
      [c.collection.TRENDING]: 2,
      [c.collection.TOP_PAID]: 3
    }
  };

  const CATEGORY_CLUSTER_MAPPINGS = ['ds:3', 0, 1];
  const allCategories = R.path(CATEGORY_CLUSTER_MAPPINGS, categoryObject);
  const selectedCollection = collections[allCategories.length][collection] ||
    collections[allCategories.length][c.collection.TOP_FREE];

  const CATEGORY_CLUSTER_URL_MAPPINGS = [selectedCollection, 0, 3, 4, 2];
  const categoryClusterURL = R.path(CATEGORY_CLUSTER_URL_MAPPINGS, allCategories);

  return categoryClusterURL;
}

function parseCategoryApps (categoryObject, opts) {
  const clusterUrl = getParsedCluster(categoryObject, opts);
  const clusterUrlToProcess = `${BASE_URL}${clusterUrl}&hl=${opts.lang}&gl=${opts.country}`;

  debug('Cluster Request URL: %s', clusterUrlToProcess);

  const options = Object.assign({
    url: clusterUrlToProcess,
    method: 'GET',
    followAllRedirects: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then(clusterObject => processAndRecur(clusterObject, opts, [], INITIAL_MAPPINGS))
    .catch(console.error);
}

module.exports = parseCategoryApps;
