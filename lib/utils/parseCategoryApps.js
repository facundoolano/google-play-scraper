'use strict';

const debug = require('debug')('google-play-scraper:parseCategoryApps');
const request = require('./request');
const c = require('../constants');
const R = require('ramda');
const scriptData = require('./scriptData');
const { INITIAL_MAPPINGS } = require('../mappers/apps');
const { MAPPINGS } = require('../mappers/clusters');
const { processAndRecur } = require('../requesters/appsMappedRequests');
const { BASE_URL } = require('./configurations');
const appList = require('./appList');

/* workaround when sometimes google changes the order of things */
function checkIfCategoryIsReallyPaid (selectedCollection, allCategories) {
  const CATEGORY_FIRST_APPS_MAPPINGS = [selectedCollection, 0, 0];
  const firstApps = appList.extract(CATEGORY_FIRST_APPS_MAPPINGS, allCategories);

  return !firstApps[0].free;
}

/**
 * Get the cluster url for a given collection
 * A cluster is the URL contained in the button "See More"
 * of each category collection
 * @param {Object} categoryObject
 * @param {String} collection
 */
function getParsedCluster (categoryObject, collection) {
  const collectionMapping = c.collectionPaths[collection].includes(c.clusters.new)
    ? MAPPINGS.collections.new
    : MAPPINGS.collections.top;
  debug('collectionMapping: %o', collectionMapping);

  // This mapping reflects all the collections of a given type (new / top) and category
  // For example the URL https://play.google.com/store/apps/top?hl=en
  // gives you the "Top Free Apps", "Top Paid Apps" and so on
  const allCollections = R.path(INITIAL_MAPPINGS.collections, categoryObject);
  debug('allCollections: %o', allCollections);
  if (!allCollections) {
    throw Error(`The collection ${collection} have no clusters`);
  }

  // This mapping gives you the selected collection
  // based on the array length of all collections
  // of the category / top / new pages
  const selectedCollection = R.path([allCollections.length, collection], collectionMapping);
  debug('selectedCollection: %o', selectedCollection);

  if (typeof selectedCollection === 'undefined') {
    throw Error(`The collection ${collection} is invalid for the given category, top apps or new apps`);
  }

  // This last mapping finally gives you the cluster URL
  const COLLECTION_CLUSTER_URL_MAPPINGS = [selectedCollection, ...MAPPINGS.clusterUrl];
  const categoryClusterURL = R.path(COLLECTION_CLUSTER_URL_MAPPINGS, allCollections);

  // workaround when sometimes google changes the order of collections
  // TOP_PAID is not shown and instead is displayed TRENDING
  if (collection === c.collection.TOP_PAID) {
    return checkIfCategoryIsReallyPaid(selectedCollection, allCollections)
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
    followRedirect: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then(clusterObject => processAndRecur(clusterObject, opts, [], INITIAL_MAPPINGS))
    .catch(console.error);
}

module.exports = parseCategoryApps;
