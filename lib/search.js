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
  const url = `${BASE_URL}/work/search?q=${opts.term}&hl=${opts.lang}&gl=${opts.country}&price=${opts.price}`;
  return request(
    Object.assign({ url }, opts.requestOptions),
    opts.throttle
  ).then((html) => processFirstPage(html, opts, [], INITIAL_MAPPINGS));
}

function extaractDeveloperId (link) {
  return link.split('?id=')[1];
}

async function processFirstPage (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const appsMapping = {
    title: [2],
    appId: [12, 0],
    url: {
      path: [9, 4, 2],
      fun: (path) => new url.URL(path, BASE_URL).toString()
    },
    icon: [1, 1, 0, 3, 2],
    developer: [4, 0, 0, 0],
    developerId: {
      path: [4, 0, 0, 1, 4, 2],
      fun: extaractDeveloperId
    },
    currency: [7, 0, 3, 2, 1, 0, 1],
    price: {
      path: [7, 0, 3, 2, 1, 0, 0],
      fun: (price) => price / 1000000
    },
    free: {
      path: [7, 0, 3, 2, 1, 0, 0],
      fun: (price) => price === 0
    },
    summary: [4, 1, 1, 1, 1],
    scoreText: [6, 0, 2, 1, 0],
    score: [6, 0, 2, 1, 1]
  };

  const sections = R.path(mappings.sections, html) || [];
  if (noResultsFound(sections)) return [];

  const tokenSection = sections.filter((section) => isTokenSection(section))[0];
  const appsSection = R.path(mappings.apps, html);

  // parse each item in appsSection array
  const processedApps = R.map(scriptData.extractor(appsMapping), appsSection);

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(SECTIONS_MAPPING.token, tokenSection);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

function isTokenSection (section) {
  const sectionToken =
    R.is(Array, section) && R.path(SECTIONS_MAPPING.token, section);
  return R.is(String, sectionToken);
}

function noResultsFound (sections) {
  if (sections.length === 0) {
    return true;
  }
}

const INITIAL_MAPPINGS = {
  apps: ['ds:1', 0, 1, 0, 0, 0],
  sections: ['ds:1', 0, 1, 0, 0]
};

const SECTIONS_MAPPING = {
  token: [1]
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
