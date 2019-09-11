'use strict';

const debug = require('debug')('google-play-scraper:list');
const request = require('./utils/request');
const qs = require('querystring');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const parseCategoryApps = require('./utils/parseCategoryApps');
const { BASE_URL } = require('./utils/configurations');

function list (opts) {
  return new Promise(function (resolve, reject) {
    opts = R.clone(opts || {});
    validate(opts);

    const options = Object.assign({
      url: buildUrl(opts),
      method: 'GET',
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseCategoryApps(parsedObject, opts))
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

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';
  opts.num = opts.num || 500;
}

function buildUrl (opts) {
  const url = `${BASE_URL}/store/apps`;
  const path = (opts.category)
    ? `/top/category/${opts.category}`
    : `/top`;

  const queryString = {
    hl: opts.lang,
    gl: opts.country,
    lang: opts.lang,
    country: opts.country
  };

  if (opts.age) {
    queryString.age = opts.age;
  }

  const fullURL = `${url}${path}?${qs.stringify(queryString)}`;

  debug('Initial Request URL: %s', fullURL);

  return fullURL;
}

module.exports = list;
