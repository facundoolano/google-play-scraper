import * as R from 'ramda';
import url from 'url';
import request from './utils/request.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/processPages.js';
import scriptData from './utils/scriptData.js';

/*
 * Make the first search request as in the browser and call `checkfinished` to
 * process the next pages.
 */
function initialRequest (opts) {
  const searchUrl = `${BASE_URL}/store/search?c=apps&q=${opts.term}&hl=${opts.lang}&gl=${opts.country}&price=${opts.price}`;
  return request(
    Object.assign({ url: searchUrl }, opts.requestOptions),
    opts.throttle
  ).then((html) => processFirstPage(html, opts, [], INITIAL_MAPPINGS));
}

function extaractDeveloperId (link) {
  return link ? link.split('?id=')[1] : undefined;
}

async function processFirstPage (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const appsMapping = {
    title: [0, 3],
    appId: [0, 0, 0],
    url: {
      path: [0, 10, 4, 2],
      fun: (path) => new url.URL(path, BASE_URL).toString()
    },
    icon: [0, 1, 3, 2],
    developer: [0, 14],
    developerId: [0, 14],
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
  };

  const sections = R.path(mappings.sections, html) || [];
  if (sections.length === 0) return [];

  // Find the section containing the search result apps
  let appsSection = null;
  let tokenValue = null;

  for (const section of sections) {
    const apps = R.path(SECTIONS_MAPPING.apps, section);
    if (Array.isArray(apps) && apps.length > 0) {
      appsSection = apps;
      tokenValue = R.path(SECTIONS_MAPPING.token, section);
      break;
    }
  }

  if (!appsSection) return [];

  const processedApps = R.map(scriptData.extractor(appsMapping), appsSection);

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;

  return checkFinished(opts, [...savedApps, ...apps], tokenValue);
}

const INITIAL_MAPPINGS = {
  sections: ['ds:4', 0, 1]
};

const SECTIONS_MAPPING = {
  apps: [22, 0],
  token: [22, 1, 3, 1]
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

    initialRequest(opts).then(resolve).catch(reject);
  }).then((results) => {
    if (opts.fullDetail) {
      // if full detail is wanted get it from the app module
      return Promise.all(
        results.map((app) => appData({ ...opts, appId: app.appId }))
      );
    }
    return results;
  });
}

export default search;
