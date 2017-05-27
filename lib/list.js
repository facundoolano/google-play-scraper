'use strict';

const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');
const R = require('ramda');
const c = require('./constants');
const getParseList = require('./utils/parseList');

function list (opts) {
  return new Promise(function (resolve, reject) {
    opts = R.clone(opts || {});
    validate(opts);

    const options = {
      url: buildUrl(opts),
      method: 'POST',
      form: opts.form,
      proxy: opts.proxy
    };

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
    throw Error('Cannot retrieve more than 120 apps at a time');
  }

  opts.start = opts.start || 0;
  if (opts.start > 500) {
    throw Error('The maximum starting index is 500');
  }

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';
  opts.form = {start: opts.start};
}

function buildUrl (opts) {
  let url = 'https://play.google.com/store/apps';

  if (opts.category) {
    url += `/category/${opts.category}`;
  }

  url += `/collection/${opts.collection}`;
  url += `?hl=${opts.lang}&gl=${opts.country}&num=${opts.num}`;

  if (opts.age) {
    url += `&age=${opts.age}`;
  }

  return url;
}

module.exports = memoize(list);
