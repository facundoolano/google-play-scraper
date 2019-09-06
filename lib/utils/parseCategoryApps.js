'use strict';

const debug = require('debug')('google-play-scraper:parseCategoryApps');
const request = require('./request');
const c = require('../constants');
const R = require('ramda');
const scriptData = require('./scriptData');
const { INITIAL_MAPPINGS } = require('../mappers/request');
const { processAndRecur } = require('./dsMappedRequests');
const { BASE_URL } = require('./configurations');

const defaultMapper = 'default';

function defineCollection (category) {
  if (category.indexOf(c.category.FAMILY) >= 0) return c.category.FAMILY;
  if (category.indexOf(c.category.GAME) >= 0) return c.category.GAME;

  return defaultMapper;
}

function getParsedCluster (categoryObject, { category, collection }) {
  const definedCollection = defineCollection(category);

  const collections = {
    [c.category.GAME]: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.TOP_PAID]: 1,
      [c.collection.GROSSING]: 2
    },
    [c.category.FAMILY]: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.TOP_PAID]: 1
    },
    default: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.GROSSING]: 1,
      [c.collection.TRENDING]: 2,
      [c.collection.TOP_PAID]: 3
    }
  };

  const selectedCollection = collections[definedCollection][collection] || collections[defaultMapper][c.collection.TOP_FREE];

  const CATEGORY_CLUSTER_MAPPINGS = ['ds:3', 0, 1, selectedCollection, 0, 3, 4, 2];

  return R.path(CATEGORY_CLUSTER_MAPPINGS, categoryObject);
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
