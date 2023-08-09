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

function extaractDeveloperId (link) {
  return link.split('?id=')[1];
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
      fun: extaractDeveloperId
    },
    currency: [17, 0, 2, 0, 1, 0, 1],
    price: {
      path: [17, 0, 2, 0, 1, 0, 0],
      fun: (price) => price / 1000000
    },
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

  removeUnneededSections(html, mappings);

  const sections = R.path(mappings.sections, html);
  if (noResultsFound(sections, opts)) return [];

  const moreResultsSection = sections.filter(section => isMoreSection(section))[0];
  const mainAppSection = R.path(mappings.app, html);

  const processedApps = R.map(scriptData.extractor(moreResultsMapping), R.path(SECTIONS_MAPPING.apps, moreResultsSection));
  if (mainAppSection) {
    processedApps.unshift(scriptData.extractor(mainAppMapping)(mainAppSection));
  }

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts)
    : processedApps;
  const token = R.path(SECTIONS_MAPPING.token, moreResultsSection);

  return checkFinished(opts, [...savedApps, ...apps], token);
}

function isMoreSection (section) {
  const sectionTitle = R.path(SECTIONS_MAPPING.title, section);
  return R.is(String, sectionTitle);
}

/**
 * Removes unused sections that contain no app informations
 * Removed sections:
 * * About these results
 * * Suggested message
 *
 * Note: For EU countries the suggested message is shown before the About section
 *       while for no result it is reverted
 */
function removeUnneededSections (html, mappings) {
  removeSectionsIfPathValueOfType(html, SECTIONS_MAPPING.aboutResultsTitle, String);
  // if the search function does no longer throw when no result was returned
  // mapping SECTIONS_MAPPING.suggestedResultDescritpion can be replaced with SECTIONS_MAPPING.noResult mapping
  removeSectionsIfPathValueOfType(html, [...mappings.sections, 0, ...SECTIONS_MAPPING.suggestedResultDescritpion], String);
  removeSectionsIfPathValueOfType(html, SECTIONS_MAPPING.aboutResultsTitle, String);
}

function removeSectionsIfPathValueOfType (html, path, type) {
  if (R.is(type, R.path(path, html))) {
    R.path(INITIAL_MAPPINGS.sections, html).shift();
  }
}

function noResultsFound (sections, opts) {
  return sections.some(section => {
    const noResults = R.path(SECTIONS_MAPPING.noResults, section);
    return R.is(String, noResults) && noResults.endsWith(`<b>${opts.term}</b>`);
  });
}

const INITIAL_MAPPINGS = {
  app: ['ds:4', 0, 1, 0, 23],
  sections: ['ds:4', 0, 1]
};

const SECTIONS_MAPPING = {
  title: [22, 1, 0],
  token: [22, 1, 3, 1],
  apps: [22, 0],
  noResults: [25, 0, 0, 0, 1],
  suggestedResultDescritpion: [25, 0, 0, 1, 1],
  aboutResultsTitle: ['ds:4', 0, 1, 0, 31, 0]
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
      throw Error('The number of results can\'t exceed 250');
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

export default search;
