'use strict';

const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');

const getParseList = require('./utils/parseList');

function search (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.term) {
      throw Error('Search term missing');
    }

    if (opts.num && opts.num > 250) {
      throw Error("The number of results can't exceed 250");
    }

    const query = {
      term: encodeURIComponent(opts.term),
      lang: opts.lang || 'en',
      country: opts.country || 'us',
      num: opts.num || 20,
      apps: [],
      fullDetail: opts.fullDetail,
      price: opts.price ? getPriceGoogleValue(opts.price) : 0,
      throttle: opts.throttle,
      proxy: opts.proxy
    };

    doSearch(query)
      .then(resolve)
      .catch(reject);
  });
}

function buildUrl (query) {
  let url = 'https://play.google.com/store/search?c=apps&pagtt=1&q=' + query.term + '&hl=' + query.lang + '&gl=' + query.country + '&price=' + query.price;

  if (query.nextToken) {
    url += '&pagTok=' + query.nextToken;
  }

  if (query.sp) {
    url += '&sp=' + query.sp;
  }
  return url;
}

// TODO this mutates the query object way too much, refactor to make ite cleaner
function doSearch (query) {
  // sometimes the first result page is a cluster of subsections,
  // need to skip to the full results page
  function skipClusterPage (html) {
    const match = html.match(/amp;sp=(.*?)"/);

    if (match && !getNextToken(html)) {
      query.sp = match[1];
      return request({
        url: buildUrl(query),
        proxy: query.proxy
      }, query.throttle);
    }
    return html;
  }

  function processResponse (html) {
    query.nextToken = getNextToken(html);
    const $ = cheerio.load(html);
    return getParseList(query)($);
  }

  function processApps (apps) {
    query.apps = query.apps.concat(apps);
    return query;
  }

  const options = {
    url: buildUrl(query),
    proxy: query.proxy
  };

  return request(options, query.throttle)
    .then(skipClusterPage)
    .then(processResponse)
    .then(processApps)
    .then(checkFinished);
}

function getNextToken (html) {
  // extract the token for the next page request
  // for the record, I hate regexps
  // const s = html.match(/\\42(GAE.+?)\\42/);
  const s = html.match(/\\x22(GAE.+?)\\x22/);
  if (!s) {
    return undefined;
  }
  return s[1].replace(/\\\\u003d/g, '=');
}

function checkFinished (query) {
  // if enough resutls or no more pages, return
  if (query.apps.length >= query.num || !query.nextToken) {
    return query.apps.slice(0, query.num);
  }

  // else fetch next page
  return doSearch(query);
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

module.exports = memoize(search);
