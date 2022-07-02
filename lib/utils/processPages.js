'use strict';

const debug = require('debug')('google-play-scraper:processPages');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const appList = require('../utils/appList');
const { BASE_URL } = require('../constants');
const appDetails = require('../app');

// FIXME this should be its own helper, and live in utils
// FIXME should receive mappings.apps and mappings.token as separate variables
// FIXME opts should be the last element?
// TODO add a good docstring for this one
async function processPages (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const processedApps = appList.extract(mappings.apps, mappings.appsAlt, html);
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(mappings.token, html);

  return checkFinished(opts, [...savedApps, ...apps], token);
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

const REQUEST_MAPPINGS = {
  apps: [0, 22, 0],
  token: [0, 22, 1, 3, 1]
};

function checkFinished (opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const body = getBodyForRequests({
    numberOfApps: opts.numberOfApps,
    withToken: nextToken
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&source-path=/store/apps/developer&f.sid=5540864258265546590&bl=boq_playuiserver_20220606.06_p1&hl=${opts.lang}&authuser=0&soc-app=121&soc-platform=1&soc-device=1&_reqid=773397&rt=c`;
  
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
      const input = JSON.parse(html.split('\n')[3]);
      const data = JSON.parse(input[0][2]);

      return (data === null)
        ? savedApps
        : processPages(data, opts, savedApps, REQUEST_MAPPINGS);
    });
}

function getBodyForRequests ({
  numberOfApps = 100,
  withToken = '%token%'
}) {
  const body = `f.req=%5B%5B%5B%22qnKhOb%22%2C%22%5B%5Bnull%2C%5B%5B10%2C%5B20%5D%5D%2Ctrue%2Cnull%2C%5B96%2C108%2C72%2C27%2C8%2C57%2C169%2C30%2C110%2C11%2C16%2C1%2C139%2C152%2C165%2C163%2C9%2C71%2C31%2C195%2C12%2C64%2C151%2C150%2C148%2C113%2C104%2C55%2C56%2C145%2C32%2C34%2C10%2C122%5D%5D%2Cnull%2C%5C%22${withToken}%5C%22%5D%2C%5Btrue%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AFSRYlwKfU4N9lNFPhofJ03SZ3pE%3A1654903395365&`

  return body;
}

module.exports = { processPages, processFullDetailApps, checkFinished };
