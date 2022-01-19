'use strict';

const debug = require('debug')('google-play-scraper:list');
const request = require('./utils/request');
const qs = require('querystring');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const processPages = require('./utils/processPages');
const { BASE_URL } = require('./constants');

function list (opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);

    const fullListOpts = Object.assign({
      lang: 'en',
      country: 'us',
      num: 500
    }, opts);

    const requestOptions = Object.assign({
      url: buildInitialUrl(fullListOpts),
      method: 'GET',
      followRedirect: true
    }, opts.requestOptions);

    request(requestOptions, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseCategoryApps(parsedObject, fullListOpts))
      .then(resolve)
      .catch(reject);
  });
}

function validate (opts) {
  if (opts.category && !R.contains(opts.category, R.values(c.category))) {
    throw Error('Invalid category ' + opts.category);
  }

  opts.collection = opts.collection || c.collection.TOP_FREE;
  if (!R.contains(opts.collection, R.values(c.collection))) {
    throw Error(`Invalid collection ${opts.collection}`);
  }

  if (opts.age && !R.contains(opts.age, R.values(c.age))) {
    throw Error(`Invalid age range ${opts.age}`);
  }
}

function defineCollectionUrl (opts) {
  const { collection, category } = opts;
  const baseUrl = `${BASE_URL}/store/apps`;
  const path = collection.startsWith('NEW_') ? `${baseUrl}/new` : `${baseUrl}/top`;
  return (category)
    ? `${path}/category/${category}`
    : path;
}

function buildInitialUrl (opts) {
  const url = defineCollectionUrl(opts);

  // For the initial collection lookup we force the language to english
  // since we depend on collection names to identify the proper cluster later on
  const queryString = {
    hl: 'us',
    gl: opts.country
  };

  if (opts.age) {
    queryString.age = opts.age;
  }

  const fullURL = `${url}?${qs.stringify(queryString)}`;

  debug('Initial Request URL: %s', fullURL);

  return fullURL;
}

const COLLECTIONS_MAPPING = ['ds:3', 0, 1];
const CLUSTER_URL_MAPPING = [0, 0, 3, 4, 2];
const CLUSTER_NAME_MAPPING = [0, 1];
const CLUSTER_NAMES = {
  TOP_FREE: 'top free apps',
  TOP_PAID: 'top paid apps',
  GROSSING: 'top grossing apps',
  TOP_FREE_GAMES: 'top free games',
  TOP_PAID_GAMES: 'top paid games',
  TOP_GROSSING_GAMES: 'top grossing games',
  TRENDING: 'trending',
  NEW_FREE: 'top new free android apps',
  NEW_PAID: 'top new paid android apps',
  NEW_FREE_GAMES: 'top new free games',
  NEW_PAID_GAMES: 'top new paid games'
};

const APP_MAPPINGS = {
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1]
};

/**
 * Get the cluster url for a given collection
 * A cluster is the URL contained in the button "See More"
 * of each category collection
 * @param {Object} categoryObject
 * @param {String} collection
 */
function findCluster (categoryObject, collection) {
  // This mapping reflects all the collections of a given type (new / top) and category
  // For example the URL https://play.google.com/store/apps/top?hl=en
  // gives you the "Top Free Apps", "Top Paid Apps" and so on
  const allCollections = R.path(COLLECTIONS_MAPPING, categoryObject);
  debug('allCollections: %o', allCollections);
  if (!allCollections) {
    throw Error(`The collection ${collection} have no clusters`);
  }

  // a collection can be present or not, either as a global list or
  // on a given category. This attempts to find the requested collection
  // among the clusters based on its English name (e.g. "top grossing apps")
  debug('looking for collection: %s', CLUSTER_NAMES[collection]);
  const selectedCollection = allCollections.filter((data) =>
    R.path(CLUSTER_NAME_MAPPING, data).toLowerCase() === CLUSTER_NAMES[collection]
  );

  debug('selectedCollection: %o', selectedCollection);

  if (typeof selectedCollection === 'undefined') {
    throw Error(`The collection ${collection} is invalid for the given category, top apps or new apps`);
  }

  return R.path(CLUSTER_URL_MAPPING, selectedCollection);
}

function parseCategoryApps (categoryObject, opts) {
  const { collection } = opts;
  const clusterUrl = findCluster(categoryObject, collection);

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
    .then(clusterObject => processPages(clusterObject, opts, [], APP_MAPPINGS))
    .catch(console.error);
}

module.exports = list;
