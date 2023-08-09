import * as R from 'ramda';
import url from 'url';
import request from './utils/request.js';
import queryString from 'querystring';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/processPages.js';
import createDebug from 'debug';

const debug = createDebug('google-play-scraper:similar');

function similar (opts) {
  return new Promise(function (resolve, reject) {
    validateSimilarParameters(opts);

    const mergedOpts = Object.assign({},
      {
        appId: encodeURIComponent(opts.appId),
        lang: opts.lang || 'en',
        country: opts.country || 'us',
        fullDetail: opts.fullDetail
      });

    const qs = queryString.stringify({
      id: mergedOpts.appId,
      hl: 'en',
      gl: mergedOpts.country
    });

    const similarUrl = `${BASE_URL}/store/apps/details?${qs}`;
    const options = Object.assign({
      url: similarUrl,
      followRedirect: true
    }, opts.requestOptions);

    debug('Similar Request URL: %s', similarUrl);

    request(options, opts.throttle)
      .then(scriptData.parse)
      .then(parsedObject => parseSimilarApps(parsedObject, mergedOpts))
      .then(resolve)
      .catch(reject);
  });
}

function validateSimilarParameters (opts) {
  if (!opts || !opts.appId) {
    throw Error('appId missing');
  }
}

const INITIAL_MAPPINGS = {
  clusters: {
    path: [1, 1],
    useServiceRequestId: 'ag2B9c'
  },
  apps: ['ds:3', 0, 1, 0, 21, 0],
  token: ['ds:3', 0, 1, 0, 21, 1, 3, 1]
};

const CLUSTER_MAPPING = {
  title: [21, 1, 0],
  url: [21, 1, 2, 4, 2]
};

const SIMILAR_APPS = 'Similar apps';
const SIMILAR_GAMES = 'Similar games';

function parseSimilarApps (similarObject, opts) {
  const clusters = scriptData.extractDataWithServiceRequestId(similarObject, INITIAL_MAPPINGS.clusters);

  if (clusters.length === 0) {
    throw Error('Similar apps not found');
  }

  let similarAppsCluster = clusters.filter(cluster => {
    return R.path(CLUSTER_MAPPING.title, cluster) === SIMILAR_APPS ||
      R.path(CLUSTER_MAPPING.title, cluster) === SIMILAR_GAMES ||
      clusters;
  });

  if (similarAppsCluster.length === 0) {
    similarAppsCluster = clusters;
  }

  const clusterUrl = getParsedCluster(similarAppsCluster[0]);

  const fullClusterUrl = `${BASE_URL}${clusterUrl}&gl=${opts.country}&hl=${opts.lang}`;
  debug('Cluster Request URL: %s', fullClusterUrl);

  const options = Object.assign({
    url: fullClusterUrl,
    followRedirect: true
  }, opts.requestOptions);

  return request(options, opts.throttle)
    .then(scriptData.parse)
    .then((htmlParsed) => processFirstPage(htmlParsed, opts, [], INITIAL_MAPPINGS));
}

async function processFirstPage (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const mapping = {
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

  const processedApps = R.map(scriptData.extractor(mapping), R.path(mappings.apps, html));

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(mappings.token, html);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

function getParsedCluster (similarObject) {
  const clusterUrl = R.path(CLUSTER_MAPPING.url, similarObject);
  return clusterUrl;
}

export default similar;
