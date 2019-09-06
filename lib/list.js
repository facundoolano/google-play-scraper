'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');
const R = require('ramda');
const c = require('./constants');
const scriptData = require('./utils/scriptData');
const appList = require('./utils/appList');

const BASE_URL = 'https://play.google.com';
const body = 'f.req=%5B%5B%5B%22qnKhOb%22%2C%22%5B%5Bnull%2C%5B%5B10%2C%5B10%2C50%5D%5D%2Ctrue%2Cnull%2C%5B96%2C27%2C4%2C8%2C57%2C30%2C110%2C79%2C11%2C16%2C49%2C1%2C3%2C9%2C12%2C104%2C55%2C56%2C51%2C10%2C34%2C77%5D%5D%2Cnull%2C%5C%22%token%%5C%22%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D';
const INITIAL_MAPPINGS = {
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1]
};

const REQUEST_MAPPINGS = {
  apps: [0, 0, 0],
  token: [0, 0, 7, 1]
};

function list (getParseList, opts) {
  if (opts.category) {
    return listCategoryApps({}, opts);
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
    throw Error('Cannot retrieve more than 120 apps at a time');
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
    ? `/top/category/${opts.category}`
    : `/collection/${opts.collection}`;

  url += `?hl=${opts.lang}&gl=${opts.country}&num=${opts.num}`;

  if (opts.age) {
    url += `&age=${opts.age}`;
  }

  console.log(url);

  return url;
}

function getParsedCluster (object, opts) {
  const collections = {
    [c.collection.TOP_FREE]: 0,
    [c.collection.GROSSING]: 1,
    [c.collection.TRENDING]: 2,
    [c.collection.TOP_PAID]: 3
  };

  const selectedCollection = collections[opts.collection] || collections[c.collection.TOP_FREE];

  const CLUSTER_MAPPINGS = ['ds:3', 0, 1, selectedCollection, 0, 3, 4, 2];

  return R.path(CLUSTER_MAPPINGS, object);
}

function processAndRecur (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const apps = appList.extract(mappings.apps, html);
  const token = R.path(mappings.token, html);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

function checkFinished (opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const requestOptions = Object.assign({
    url: `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=en&gl=us&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`,
    method: 'POST',
    body: body.replace('%token%', nextToken),
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => {
      const input = JSON.parse(html.substring(5));
      const data = JSON.parse(input[0][2]);

      return processAndRecur(data, opts, savedApps, REQUEST_MAPPINGS);
    });
}

function getParsedApps (object, opts) {
  return processAndRecur(object, opts, [], INITIAL_MAPPINGS);
}

function processCluster (clusterUrl, opts) {
  const clusterUrlToProcess = `${BASE_URL}${clusterUrl}&hl=${opts.lang}&gl=${opts.country}&num=${opts.num}`;

  const options = Object.assign({
    url: clusterUrlToProcess,
    method: 'GET',
    followAllRedirects: true
  });

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then(object => getParsedApps(object, opts))
    .catch(console.log);
}

function listCategoryApps (func, opts) {
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
      .then(parsedObject => getParsedCluster(parsedObject, opts))
      .then(clusterUrl => processCluster(clusterUrl, opts))
      .then(resolve)
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

module.exports = list;
