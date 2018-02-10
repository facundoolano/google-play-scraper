'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');

function getClp (html) {
  // Try to find clp from "next page" html elem.
  let match = html.match(/\?clp=(.*?)">/);
  // ... if we don't have it, we're probably on innerPage;
  // try to parse it from search_collection_more_results_cluster instead
  // var curl='https://play.google.com/store/apps/collection/search_collection_more_results_cluster?clp\x3dggENCgVwYW5kYRABGgIIAA%3D%3D:S:ANO1ljKV8KM';
  if (!match) match = html.match(/\?clp\\x3d(.*?)';/);
  return match && match[1].replace(/%3D/g, '=');
}

function getNextToken (html) {
  // extract the token for the next page request
  // for the record, I hate regexps
  // const s = html.match(/\\42(GAE.+?)\\42/);
  const s = html.match(/\\x22-p6(.*?):S:(.*?)\\x22/g);
  if (!s) {
    return undefined;
  }
  return s[0].replace(/\\\\u003d/g, '=').replace(/\\x22/g, '');
}

/*
 * Extract navigation tokens for next pages, parse results and call
 * `checkFinished` to repeat the process with next page if necessary.
 */
function processAndRecur (html, opts, savedApps, clp) {
  const nextToken = getNextToken(html);
  clp = clp || getClp(html);

  const $ = cheerio.load(html);
  return opts.getParseList(opts)($)
    .then((newApps) => savedApps.concat(newApps))
    .then((apps) => checkFinished(opts, apps, nextToken, clp));
}

/*
 * If already have requested results or there are no more pages, return current
 * app list, otherwise request the ajax endpoint of the next page and process
 * the results.
 */
function checkFinished (opts, savedApps, nextToken, clp) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const requestOptions = Object.assign({
    url: 'https://play.google.com/store/apps/collection/search_results_cluster_apps',
    method: 'POST',
    form: {
      num: savedApps.length === 49 ? 0 : 48, // confirm if always 48 works
      start: savedApps.length - 49,
      pagTok: nextToken,
      clp,
      pagtt: 3,
      hl: opts.lang,
      gl: opts.country
    },
    followAllRedirects: true
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => processAndRecur(html, opts, savedApps, clp));
}

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
      const innerUrl = 'https://play.google.com/' + match[0].split(/"/)[1];
      return request(Object.assign({
        url: innerUrl
      }, opts.requestOptions), opts.throttle);
    }
    return html;
  }

  const url = `https://play.google.com/store/search?c=apps&q=${opts.term}&hl=${opts.lang}&gl=${opts.country}&price=${opts.price}`;
  return request(Object.assign({url}, opts.requestOptions), opts.throttle)
    .then(skipClusterPage)
    .then((html) => processAndRecur(html, opts, []));
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

function search (getParseList, opts) {
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
      getParseList,
      requestOptions: opts.requestOptions
    };

    initialRequest(opts)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = search;
