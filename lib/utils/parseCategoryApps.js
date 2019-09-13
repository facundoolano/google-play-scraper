'use strict';

const debug = require('debug')('google-play-scraper:parseCategoryApps');
const request = require('./request');
const c = require('../constants');
const R = require('ramda');
const scriptData = require('./scriptData');
const { INITIAL_MAPPINGS } = require('../mappers/apps');
const { processAndRecur } = require('../requesters/appsMappedRequests');
const { BASE_URL } = require('./configurations');
const appList = require('./appList');

/* workaround when sometimes google changes the order of things */
function checkIfCategoryIsReallyPaid (selectedCollection, allCategories) {
  const CATEGORY_FIRST_APPS_MAPPINGS = [selectedCollection, 0, 0];
  const firstApps = appList.extract(CATEGORY_FIRST_APPS_MAPPINGS, allCategories);

  return !firstApps[0].free;
}

function getParsedCluster (categoryObject, collection) {
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
    },
    6: {
      [c.collection.TOP_FREE]: 0,
      [c.collection.TOP_PAID]: 1,
      [c.collection.GROSSING]: 2,
      [c.collection.TOP_FREE_GAMES]: 3,
      [c.collection.TOP_PAID_GAMES]: 4,
      [c.collection.TOP_GROSSING_GAMES]: 5
    }
  };

  const allCategories = R.path(INITIAL_MAPPINGS.categories, categoryObject);
  const selectedCollection = R.path([allCategories.length, collection], collections);

  if (typeof selectedCollection === 'undefined') {
    throw Error('The collection is invalid for the given category or top apps');
  }

  const CATEGORY_CLUSTER_URL_MAPPINGS = [selectedCollection, 0, 3, 4, 2];
  const categoryClusterURL = R.path(CATEGORY_CLUSTER_URL_MAPPINGS, allCategories);

  /* workaround when sometimes google changes the order of categories */
  /* TOP_PAID is not shown and instead is displayed TRENDING */
  if (collection === c.collection.TOP_PAID) {
    return checkIfCategoryIsReallyPaid(selectedCollection, allCategories)
      ? categoryClusterURL
      : undefined;
  }

  return categoryClusterURL;
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
    followAllRedirects: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then(clusterObject => processAndRecur(clusterObject, opts, [], INITIAL_MAPPINGS))
    .catch(console.error);
}

module.exports = parseCategoryApps;
