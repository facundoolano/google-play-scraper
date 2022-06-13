'use strict';

const debug = require('debug')('google-play-scraper:processPages');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const appList = require('../utils/appList');
const { BASE_URL } = require('../constants');
const appDetails = require('../app');

const fs = require('fs');
const { join } = require('path');

// FIXME this should be its own helper, and live in utils
// FIXME should receive mappings.apps and mappings.token as separate variables
// FIXME opts should be the last element?
// TODO add a good docstring for this one
async function processPages (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const { results: processedApps, token: moreInfoToken } = appList.extract(mappings.apps, mappings.moreResults, html);
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;

  const token = moreInfoToken || R.path(mappings.token, html);

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
        : processPages(data, opts, savedApps, REQUEST_MAPPINGS);
    });
}

function getBodyForRequests ({
  numberOfApps = 100,
  withToken = '%token%'
}) {
  // Get current script path
  let body = fs.readFileSync(join(process.cwd(), './data/fetchMoreRequest.data')).toString('utf8');

  body = body.replace(/{%token%}/g, withToken);
  body = body.replace(/{%numOfApps%}/g, numberOfApps);

  return body;
}

module.exports = processPages;
