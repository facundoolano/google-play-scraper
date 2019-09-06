'use strict';

const debug = require('debug')('google-play-scraper:list');
const request = require('./utils/request');
const cheerio = require('cheerio');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const parseCategoryApps = require('./utils/parseCategoryApps');
const { BASE_URL } = require('./utils/configurations');

function list (getParseList, opts) {
  if (opts.category) {
    return listCategoryApps(opts);
  }

  return new Promise(function (resolve, reject) {
    opts = R.clone(opts || {});
    validate(opts);

    const options = Object.assign({
      url: buildUrl(opts),
      method: 'POST',
      form: opts.form,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(cheerio.load)
      .then(getParseList(opts))
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

  opts.num = opts.num || 60;
  if (opts.num > 120) {
    throw Error(`Cannot retrieve more than 120 apps at a time`);
  }

  opts.start = opts.start || 0;
  if (opts.start > 500) {
    throw Error('The maximum starting index is 500');
  }

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';
  opts.form = { start: opts.start };
}

function buildUrl (opts) {
  let url = `${BASE_URL}/store/apps`;

  url += (opts.category)
    ? `/top/category/${opts.category}?`
    : `/collection/${opts.collection}?num=${opts.num}&`;

  url += `hl=${opts.lang}&gl=${opts.country}`;

  if (opts.age) {
    url += `&age=${opts.age}`;
  }

  debug('Initial Request URL: %s', url);

  return url;
}

function listCategoryApps (opts) {
  return new Promise(function (resolve, reject) {
    opts = R.clone(opts || {});

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

module.exports = list;
