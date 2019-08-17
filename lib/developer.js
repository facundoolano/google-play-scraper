'use strict';

const request = require('./utils/request');
const R = require('ramda');
const scriptData = require('./utils/scriptData');
const appList = require('./utils/appList');
const app = require('./app');

const REQUEST_MAPPINGS = {
  tokenFirst: ['ds:3', 0, 1, 0, 0, 7, 1],
  appsFirst: ['ds:3', 0, 1, 0, 0, 0],
  token: [0, 0, 7, 1],
  apps: [0, 0, 0]
};

// Try to find clp from "next page" html elem.
function getClp (html) {
  const s = html.match(/\?clp\\u003d(.*)\x22]/g);
  if (!s) {
    return undefined;
  }
  return s[0].replace(/\?clp\\u003d/g, '').replace(/\\u0026/g, '&').replace(/\x22]/g, '').replace(/\\u003d/g, '=');
}

function getParseList (opts, apps) {
  if (opts.fullDetail) {
    return getParseDetailList(apps, opts);
  }

  return Promise.resolve(apps);
}

function getParseDetailList (apps, opts) {
  const promises = apps.map(function (application) {
    const appId = application.appId;
    return app({
      appId: appId,
      lang: opts.lang,
      country: opts.country,
      cache: opts.cache
    });
  });

  return Promise.all(promises);
}

function processAndRecur (html, opts, savedApps) {
  html = html.substring(4).replace(/\\n/g, '');
  const json = JSON.parse(html);
  const nestedJson = JSON.parse(json[0][2]);
  const nextToken = R.path(REQUEST_MAPPINGS.token, nestedJson);

  const apps = appList.extract(REQUEST_MAPPINGS.apps, nestedJson);
  return getParseList(opts, apps)
    .then(apps => checkFinished(opts, savedApps.concat(apps), nextToken));
}

function processAndRecurFirst (html, opts, savedApps) {
  html = scriptData.parse(html);
  const token = R.path(REQUEST_MAPPINGS.tokenFirst, html);
  const newApps = appList.extract(REQUEST_MAPPINGS.appsFirst, html);
  return getParseList(opts, newApps)
    .then(apps => checkFinished(opts, savedApps.concat(apps), token));
}

const body = 'f.req=%5B%5B%5B%22qnKhOb%22%2C%22%5B%5Bnull%2C%5B%5B10%2C%5B20%5D%5D%2Ctrue%2Cnull%2C%5B96%2C27%2C4%2C8%2C57%2C30%2C110%2C79%2C11%2C16%2C49%2C1%2C3%2C9%2C12%2C104%2C55%2C56%2C51%2C10%2C34%2C77%5D%5D%2Cnull%2C%5C%22%token%%5C%22%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&';

function checkFinished (opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }
  const requestOptions = Object.assign({
    url: buildNextUrl(),
    method: 'POST',
    body: body.replace('%token%', nextToken),
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => processAndRecur(html, opts, savedApps))
    .catch((err) => {
      // gplay seems to be fetching pages until one is a 404, probably a bug,
      // but doing the same here
      if (err.status === 404) {
        return savedApps;
      }
      throw err;
    });
}

function buildNextUrl () {
  return 'https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&bl=boq_playuiserver_20190807.02_p0&hl=en&gl=us&authuser=0&soc-app=121&soc-platform=1&soc-device=1';
}

function buildInitialUrlInt (opts) {
  return `https://play.google.com/store/apps/dev?id=${opts.devId}&hl=${opts.lang}&gl=${opts.country}`;
}

function buildInitialUrlStr (opts) {
  const devId = encodeURIComponent(opts.devId);
  return `https://play.google.com/store/apps/developer?id=${devId}&hl=${opts.lang}&gl=${opts.country}&term=${devId}`;
}

function initialRequestStr (opts) {
  return request(Object.assign({ url: buildInitialUrlStr(opts) }, opts.requestOptions), opts.throttle)
    .then((html) => processAndRecurFirst(html, opts, []));
}

function initialRequestInt (opts) {
  function seeMore (html) {
    const clp = getClp(html);
    const innerUrl = `https://play.google.com/store/apps/collection/cluster?clp=${clp}&hl=${opts.lang}&gl=${opts.country} `;
    return request(Object.assign({
      url: innerUrl
    }, opts.requestOptions), opts.throttle);
  }

  return request(Object.assign({ url: buildInitialUrlInt(opts) }, opts.requestOptions), opts.throttle)
    .then(seeMore)
    .then((html) => processAndRecurFirst(html, opts, []));
}

function developer (getParseList, opts) {
  return new Promise(function (resolve, reject) {
    if (!opts.devId) {
      throw Error('devId missing');
    }

    opts = Object.assign({
      lang: 'en',
      country: 'us'
    }, opts, { getParseList });
    // for str ids, e.g. https://play.google.com/store/apps/developer?id=Google%20LLC
    if (isNaN(opts.devId)) {
      initialRequestStr(opts)
        .then(resolve)
        .catch(reject);
    } else {
      // for int ids, e.g https://play.google.com/store/apps/dev?id=5700313618786177705
      initialRequestInt(opts)
        .then(resolve)
        .catch(reject);
    }
  });
}

module.exports = developer;
