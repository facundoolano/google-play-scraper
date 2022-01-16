'use strict';

const debug = require('debug')('google-play-scraper:list');
const request = require('./utils/request');
const qs = require('querystring');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const { INITIAL_MAPPINGS } = require('./mappers/apps');
const { processAndRecur } = require('./requesters/appsMappedRequests');
const { BASE_URL } = require('./utils/configurations');

function list (opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);

    const fullListOpts = Object.assign({
      lang: 'en',
      country: 'us',
      num: 500
    }, opts);

    const requestOptions = Object.assign({
      url: buildUrl(fullListOpts),
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
  const path = c.collectionPaths[collection];

  return (category)
    ? `${path}/category/${category}`
    : path;
}

function buildUrl (opts) {
  const url = defineCollectionUrl(opts);

  const queryString = {
    hl: opts.lang,
    gl: opts.country
  };

  if (opts.age) {
    queryString.age = opts.age;
  }

  const fullURL = `${url}?${qs.stringify(queryString)}`;

  debug('Initial Request URL: %s', fullURL);

  return fullURL;
}

const CLUSTER_URL_MAPPING = [0, 3, 4, 2];
const CLUSTER_POSITIONS = {
  TOP_FREE: 0,
  TOP_PAID: 1,
  GROSSING: 2,
  TOP_FREE_GAMES: 3,
  TOP_PAID_GAMES: 4,
  TOP_GROSSING_GAMES: 5,

  NEW_FREE: 0,
  NEW_PAID: 1,
  NEW_FREE_GAMES: 2,
  NEW_PAID_GAMES: 3
};

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

  const collectionPosition = CLUSTER_POSITIONS[collection];
  debug('selectedCollection: %o', collectionPosition);

  if (typeof collectionPosition === 'undefined') {
    throw Error(`The collection ${collection} is invalid for the given category, top apps or new apps`);
  }

  return R.path([collectionPosition, ...CLUSTER_URL_MAPPING], allCollections);
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

module.exports = list;
