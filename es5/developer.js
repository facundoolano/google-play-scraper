'use strict';

var request = require('./utils/request');
var cheerio = require('cheerio');

// the pagination algorithm is very similar to search, so there's some -acceptable-
// duplication. look out for chances to factor common stuff
function getNextToken(html) {
  var s = html.match(/\\x22GAE(.*?):S:(.*?)\\x22/g);
  if (!s) {
    return undefined;
  }
  return s[0].replace(/\\\\u003d/g, '=').replace(/\\x22/g, '');
}

function processAndRecur(html, opts, savedApps) {
  var nextToken = getNextToken(html);

  var $ = cheerio.load(html);
  return opts.getParseList(opts)($).then(function (newApps) {
    return savedApps.concat(newApps);
  }).then(function (apps) {
    return checkFinished(opts, apps, nextToken);
  });
}

function checkFinished(opts, savedApps, nextToken) {
  if (savedApps.length >= opts.num || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  var requestOptions = Object.assign({
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

  return request(requestOptions, opts.throttle).then(function (html) {
    return processAndRecur(html, opts, savedApps);
  }).catch(function (err) {
    // gplay seems to be fetching pages until one is a 404, probably a bug,
    // but doing the same here
    if (err.status === 404) {
      return savedApps;
    }
    throw err;
  });
}

function buildUrl(opts) {
  var devId = encodeURIComponent(opts.devId);
  return 'https://play.google.com/store/apps/developer?id=' + devId + '&hl=' + opts.lang + '&gl=' + opts.country;
}

function initialRequest(opts) {
  return request(Object.assign({ url: buildUrl(opts) }, opts.requestOptions), opts.throttle).then(function (html) {
    return processAndRecur(html, opts, []);
  });
}

function developer(getParseList, opts) {
  return new Promise(function (resolve, reject) {
    if (!opts.devId) {
      throw Error('devId missing');
    }

    opts = Object.assign({
      num: 60,
      lang: 'en',
      country: 'us'
    }, opts, { getParseList: getParseList });

    initialRequest(opts).then(resolve).catch(reject);
  });
}

module.exports = developer;