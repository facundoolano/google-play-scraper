import qs from 'querystring';
import url from 'url';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import request from './utils/request.js';
import * as R from 'ramda';
import { checkFinished, processFullDetailApps } from './utils/processPages.js';
import createDebug from 'debug';

const debug = createDebug('google-play-scraper:developer');

function buildUrl (opts) {
  const { lang, devId, country } = opts;
  const url = `${BASE_URL}/store/apps`;
  const path = isNaN(opts.devId)
    ? '/developer'
    : '/dev';

  const queryString = {
    id: devId,
    hl: lang,
    gl: country
  };

  const fullURL = `${url}${path}?${qs.stringify(queryString)}`;

  debug('Initial request: %s', fullURL);

  return fullURL;
}

function developer (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts.devId) {
      throw Error('devId missing');
    }

    opts = Object.assign({
      num: 60,
      lang: 'en',
      country: 'us'
    }, opts);

    const options = Object.assign({
      url: buildUrl(opts),
      method: 'GET',
      followRedirect: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseDeveloperApps(parsedObject, opts))
      .then(resolve)
      .catch(reject);
  });
}

async function parseDeveloperApps (html, opts) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const initialMappings = isNaN(opts.devId)
    ? {
        apps: ['ds:3', 0, 1, 0, 22, 0],
        token: ['ds:3', 0, 1, 0, 22, 1, 3, 1]
      }
    : {
        apps: ['ds:3', 0, 1, 0, 21, 0],
        token: ['ds:3', 0, 1, 0, 21, 1, 3, 1]
      };

  const appsMappings = isNaN(opts.devId)
    ? {
        title: [0, 3],
        appId: [0, 0, 0],
        url: {
          path: [0, 10, 4, 2],
          fun: (path) => new url.URL(path, BASE_URL).toString()
        },
        icon: [0, 1, 3, 2],
        developer: [0, 14],
        currency: [0, 8, 1, 0, 1],
        price: {
          path: [0, 8, 1, 0, 0],
          fun: (price) => price / 1000000
        },
        free: {
          path: [0, 8, 1, 0, 0],
          fun: (price) => price === 0
        },
        summary: [0, 13, 1],
        scoreText: [0, 4, 0],
        score: [0, 4, 1]
      }
    : {
        title: [3],
        appId: [0, 0],
        url: {
          path: [10, 4, 2],
          fun: (path) => new url.URL(path, BASE_URL).toString()
        },
        icon: [1, 3, 2],
        developer: [14],
        currency: [8, 1, 0, 1],
        price: {
          path: [8, 1, 0, 0],
          fun: (price) => price / 1000000
        },
        free: {
          path: [8, 1, 0, 0],
          fun: (price) => price === 0
        },
        summary: [13, 1],
        scoreText: [4, 0],
        score: [4, 1]
      };

  const processedApps = R.map(scriptData.extractor(appsMappings), R.path(initialMappings.apps, html));
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;

  const token = R.path(initialMappings.token, html);

  return checkFinished(opts, apps, token);
}

export default developer;
