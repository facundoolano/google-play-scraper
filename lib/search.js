import R from 'ramda';
import url from 'url';
import request from './utils/request.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/processPages.js';
import scriptData from './utils/scriptData.js';

/*
  * The Mappings change depending on US vs EU country codes as well as misspelled words vs correctly spelled words
  * Suggested Results are given if a word is potentially misspelled and this needs seperate mappings to get the data for those apps
  * By default a correctly spelled word, will use the INITIAL_MAPPINGS
  * But if the word is misspelled, then we will get "suggested results" and the mappings will be slightly different
  * This is multiplied by the fact that mispelled words in EU countries need another seperate set of mappings

  * INITIAL_MAPPINGS is used to denote the first couple values of the path
  * SECTIONS_MAPPING is used to denote the path to the sections of the search results
  * mainAppMapping & moreResultsMapping can get you the rest of the values for the paths for each data point
*/

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
// Mappings used for normal search results (no misspellings aka no suggested results)
// change these mappings if searches not producing results and term is causing suggested results to be served
let INITIAL_MAPPINGS = {
  app: ['ds:4', 0, 1, 0, 23],
  sections: ['ds:4', 0, 1]
};
let SECTIONS_MAPPING = {
  title: [22, 1, 0],
  token: [22, 1, 3, 1],
  apps: [22, 0],
  noResults: [25, 0, 0, 0, 1],
  suggestedResultDescription: [25, 0, 0, 1, 1],
  aboutResultsTitle: ['ds:4', 0, 1, 0, 31, 0]
};

let SUGGESTED_APPS_MAPPING = [];
let SUGGESTED_APPS_EU_MAPPING = [];

async function processFirstPage (html, opts, savedApps, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }
  // For US country code searches, if suggested results are given the mappings will be different
  // change these mappings to fix any suggest search issues related to US country code
  if (opts.country === 'US' && typeof R.path(['ds:4', 0, 1, 0, 25, 0, 1, 1, 1], html) === 'string') {
    mappings = {
      app: ['ds:4', 0, 1, 0, 23],
      sections: ['ds:4', 0, 1, 0]
    };
    SUGGESTED_APPS_MAPPING = ['ds:4', 0, 1, 1, 22, 0];
    SECTIONS_MAPPING = {
      title: [25, 0, 0, 0, 1], // 0 1 22 1 0
      token: [25, 1, 3, 1],
      noResults: [25, 0, 0, 0, 1],
      suggestedResultDescription: [25, 0, 0, 0, 1],
      aboutResultsTitle: ['ds:4', 0, 1, 0, 31, 0]
    };
  }

  // For EU country codes, if suggest results are given, the mappings will be different again
  // changet these mappings to fix any suggest search issues related to EU country codes
  const EU_CODES = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
  if (EU_CODES.includes(opts.country) && typeof R.path(['ds:4', 0, 1, 0, 25, 0, 1, 1, 1], html) === 'string') {
    mappings = {
      app: ['ds:4', 0, 1, 0, 23],
      sections: ['ds:4', 0, 1, 0]
    };
    SUGGESTED_APPS_EU_MAPPING = ['ds:4', 0, 1, 2, 22, 0];
    SECTIONS_MAPPING = {
      title: [25, 0, 0, 0, 1], // 0 1 22 1 0
      token: [25, 1, 3, 1],
      noResults: [25, 0, 0, 0, 1],
      suggestedResultDescription: [25, 0, 0, 0, 1],
      aboutResultsTitle: ['ds:4', 0, 1, 0, 31, 0]
    };
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

  // To deal with changing mappings for suggested results and by country, we must provide conditions for each
  let processedApps;

  if (!EU_CODES.includes(opts.country) && SUGGESTED_APPS_MAPPING.length > 1) {
    processedApps = R.map(scriptData.extractor(moreResultsMapping), R.path(SUGGESTED_APPS_MAPPING, html));
  } else if (EU_CODES.includes(opts.country) && SUGGESTED_APPS_EU_MAPPING.length > 1) {
    processedApps = R.map(scriptData.extractor(moreResultsMapping), R.path(SUGGESTED_APPS_EU_MAPPING, html));
  } else {
    processedApps = R.map(scriptData.extractor(moreResultsMapping), R.path(SECTIONS_MAPPING.apps, moreResultsSection));
  }

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
  return R.is(String, sectionTitle) && R.isEmpty(sectionTitle);
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
  // mapping SECTIONS_MAPPING.suggestedResultDescription can be replaced with SECTIONS_MAPPING.noResult mapping
  removeSectionsIfPathValueOfType(html, [mappings.sections, SECTIONS_MAPPING.suggestedResultDescription], String);
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
      // make opts.country uppercase to avoid case issues
      country: opts.country ? opts.country.toUpperCase() : 'US',
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
