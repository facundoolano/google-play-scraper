'use strict';

const debug = require('debug')('google-play-scraper:list');
const request = require('./utils/request');
const qs = require('querystring');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const parseCategoryApps = require('./utils/parseCategoryApps');
const { BASE_URL } = require('./utils/configurations');
const { isNewCollection } = require('./utils/helpers');

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
      followAllRedirects: true
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
  if (isNewCollection(opts.collection)) {
    return (opts.category)
      ? `/new/category/${opts.category}`
      : '/new';
  }

  return (opts.category)
    ? `/top/category/${opts.category}`
    : '/top';
}

function buildUrl (opts) {
  const url = `${BASE_URL}/store/apps`;
  const path = defineCollectionUrl(opts);

  const queryString = {
    hl: opts.lang,
    gl: opts.country
  };

  if (opts.age) {
    queryString.age = opts.age;
  }

  const fullURL = `${url}${path}?${qs.stringify(queryString)}`;

  debug('Initial Request URL: %s', fullURL);

  return fullURL;
}

module.exports = list;
