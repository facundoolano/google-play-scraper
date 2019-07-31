'use strict';

const R = require('ramda');
const request = require('./utils/request');
const scriptData = require('./utils/scriptData');

const BASE_URL = 'https://play.google.com';

const MAPPINGS = {
  appId: [12, 0],
  title: [2],
  summary: [4, 1, 1, 1, 1],
  developer: [4, 0, 0, 0],
  developerId: {
    path: [4, 0, 0, 1, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  url: {
    path: [4, 0, 0, 1, 4, 2],
    fun: (devUrl) => `${BASE_URL}${devUrl}`
  },
  icon: [1, 1, 0, 3, 2],
  score: [6, 0, 2, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  price: [7, 0, 3, 2, 1, 0, 2]
};

// the pagination algorithm is very similar to search, so there's some -acceptable-
// duplication. look out for chances to factor common stuff
function getNextToken (html) {
  const s = html.match(/\\x22GAE(.*?):S:(.*?)\\x22/g);
  if (!s) {
    return undefined;
  }
  return s[0].replace(/\\\\u003d/g, '=').replace(/\\x22/g, '');
}

function extractor (mappings, parsedData) {
  return R.map((spec) => {
    if (R.is(Array, spec)) {
      return R.path(spec, parsedData);
    }

    const input = R.path(spec.path, parsedData);
    return spec.fun(input);
  }, mappings);
}

function processAndRecur (html, opts, savedApps) {
  const nextToken = getNextToken(html);
  const data = scriptData.parse(html);
  const parsedData = data['ds:3'][0][1][0][0][0];

  const newApps = parsedData.map(newApp => {
    const extractedApp = extractor(MAPPINGS, newApp);
    const free = !/\d/.test(extractedApp.price);
    return R.merge(extractedApp, { free });
  });
  const apps = savedApps.concat(newApps);
  return checkFinished(opts, apps, nextToken);
}

function checkFinished (opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const requestOptions = Object.assign({
    url: buildUrl(opts),
    method: 'POST',
    form: {
      num: Math.min(120, opts.num - savedApps.length),
      start: 0,
      pagTok: nextToken,
      pagtt: 1,
      hl: opts.lang,
      gl: opts.country
    },
    followAllRedirects: true
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

function buildUrl (opts) {
  const devId = encodeURIComponent(opts.devId);
  return `https://play.google.com/store/apps/developer?id=${devId}&hl=${opts.lang}&gl=${opts.country}`;
}

function initialRequest (opts) {
  return request(Object.assign({ url: buildUrl(opts) }, opts.requestOptions), opts.throttle)
    .then((html) => processAndRecur(html, opts, []));
}

function developer (getParseList, opts) {
  return new Promise(function (resolve, reject) {
    if (!opts.devId) {
      throw Error('devId missing');
    }

    opts = Object.assign({
      num: 60,
      lang: 'en',
      country: 'us'
    }, opts, { getParseList });

    initialRequest(opts)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = developer;
