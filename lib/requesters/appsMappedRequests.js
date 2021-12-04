'use strict';

const debug = require('debug')('google-play-scraper:appsMappedRequests');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const appList = require('../utils/appList');
const { REQUEST_MAPPINGS } = require('../mappers/apps');
const { BASE_URL } = require('../utils/configurations');
const appDetails = require('../app');

function getBodyForRequests ({
  numberOfApps = 100,
  withToken = '%token%'
}) {
  const body = `f.req=%5B%5B%5B%22qnKhOb%22%2C%22%5B%5Bnull%2C%5B%5B10%2C%5B10%2C${numberOfApps}%5D%5D%2Ctrue%2Cnull%2C%5B96%2C27%2C4%2C8%2C57%2C30%2C110%2C79%2C11%2C16%2C49%2C1%2C3%2C9%2C12%2C104%2C55%2C56%2C51%2C10%2C34%2C77%5D%5D%2Cnull%2C%5C%22${withToken}%5C%22%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`;

  return body;
}

async function processFullDetailApps (apps, opts) {
  const promises = apps.map(app => (
    appDetails({
      appId: app.appId,
      lang: opts.lang,
      country: opts.country,
      cache: opts.cache,
      requestOptions: opts.requestOptions
    })
  ));

  return Promise.all(promises);
}

async function processAndRecur (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const processedApps = appList.extract(mappings.apps, html);
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(mappings.token, html);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

function checkFinished (opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const body = getBodyForRequests({
    numberOfApps: opts.numberOfApps,
    withToken: nextToken
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${opts.lang}&gl=${opts.country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const requestOptions = Object.assign({
    url,
    method: 'POST',
    body,
    followRedirect: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => {
      const input = JSON.parse(html.substring(5));
      const data = JSON.parse(input[0][2]);

      return (data === null)
        ? savedApps
        : processAndRecur(data, opts, savedApps, REQUEST_MAPPINGS);
    });
}

module.exports = {
  processAndRecur
};
