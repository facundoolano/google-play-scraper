'use strict';

const R = require('ramda');
const url = require('url');
const request = require('./utils/request');
const { BASE_URL } = require('./constants');
const { processFullDetailApps, checkFinished } = require('./utils/processPages');
const appList = require('./utils/appList');
const scriptData = require('./utils/scriptData');

/*
 * Make the first search request as in the browser and call `checkfinished` to
 * process the next pages.
 */
function initialRequest (opts) {
  // sometimes the first result page is a cluster of subsections,
  // need to skip to the full results page
  function skipClusterPage (html) {
    const match = html.match(/href="\/store\/apps\/collection\/search_collection_more_results_cluster?(.*?)"/);
    if (match) {
      const innerUrl = BASE_URL + match[0].split(/"/)[1];
      return request(Object.assign({
        url: innerUrl
      }, opts.requestOptions), opts.throttle);
    }
    return html;
  }

  const url = `${BASE_URL}/store/search?c=apps&q=${opts.term}&hl=${opts.lang}&gl=${opts.country}&price=${opts.price}`;
  return request(Object.assign({ url }, opts.requestOptions), opts.throttle)
    .then(skipClusterPage)
    .then((html) => processFirstPage(html, opts, [], INITIAL_MAPPINGS));
}

async function processFirstPage (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const mainAppMapping = {
    title: [16, 2, 0, 0],
    appId: [16, 11, 0, 0],
    url: {
      path: [17, 0, 0, 4, 2],
      fun: (path) => new url.URL(path, BASE_URL).toString()
    },
    icon: [16, 2, 95, 0, 3, 2],
    developer: [16, 2, 68, 0],
    developerId: {
      path: [16, 2, 68, 1, 4, 2],
      fun: appList.extaractDeveloperId
    },
    currency: [17, 0, 2, 0, 1, 0, 1],
    price: [17, 0, 2, 0, 1, 0, 0],
    free: {
      path: [17, 0, 2, 0, 1, 0, 0],
      fun: (price) => price === 0
    },
    summary: [16, 2, 73, 0, 1],
    scoreText: [16, 2, 51, 0, 0],
    score: [16, 2, 51, 0, 1]
  };

  const moreResultsMapping = {
    title: [0, 3],
    appId: [0, 0, 0],
    url: {
      path: [0, 10, 4, 2],
      fun: (path) => new url.URL(path, BASE_URL).toString()
    },
    icon: [0, 1, 3, 2],
    developer: [0, 14],
    currency: [0, 8, 1, 0, 1],
    price: [0, 8, 1, 0, 0],
    free: {
      path: [0, 8, 1, 0, 0],
      fun: (price) => price === 0
    },
    summary: [0, 13, 1],
    scoreText: [0, 4, 0],
    score: [0, 4, 1]
  };

  const mainAppHtml = R.path(mappings.app, html);
  let mainApp = mainAppHtml === undefined ? undefined : scriptData.extractor(mainAppMapping)(mainAppHtml);
  const moreResultsHtml = R.path(mainApp ? mappings.moreResults : mappings.apps, html);
  const processedApps = R.map(scriptData.extractor(moreResultsMapping), moreResultsHtml);

  if (mainApp) {
    processedApps.unshift(mainApp);
  }
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(mainApp ? mappings.moreResultsToken : mappings.token, html);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

const INITIAL_MAPPINGS = {
  app: ['ds:4', 0, 1, 0, 23],
  similarApps: ['ds:4', 0, 1, 1, 21, 0],
  moreResults: ['ds:4', 0, 1, 2, 22, 0],
  moreResultsToken: ['ds:4', 0, 1, 2, 22, 1, 3, 1],
  apps: ['ds:4', 0, 1, 0, 22, 0],
  token: ['ds:4', 0, 1, 0, 22, 1, 3, 1]
};

function getPriceGoogleValue (value) {
  switch (value.toLowerCase()) {
    case 'free':
      return 1;
    case 'paid':
      return 2;
    case 'all':
    default:
      return 0;
  }
}

function search (appData, opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.term) {
      throw Error('Search term missing');
    }

    if (opts.num && opts.num > 250) {
      throw Error("The number of results can't exceed 250");
    }

    opts = {
      term: encodeURIComponent(opts.term),
      lang: opts.lang || 'en',
      country: opts.country || 'us',
      num: opts.num || 20,
      fullDetail: opts.fullDetail,
      price: opts.price ? getPriceGoogleValue(opts.price) : 0,
      throttle: opts.throttle,
      cache: opts.cache,
      requestOptions: opts.requestOptions
    };

    initialRequest(opts)
      .then(resolve)
      .catch(reject);
  }).then((results) => {
    if (opts.fullDetail) {
      // if full detail is wanted get it from the app module
      return Promise.all(results.map((app) => appData({ ...opts, appId: app.appId })));
    }
    return results;
  });
}

module.exports = search;
