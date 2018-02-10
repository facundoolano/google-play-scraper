'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');

// the pagination algorithm is very similar to search, so there's some -acceptable-
// duplication. look out for chances to factor common stuff
function getNextToken (html) {
  const s = html.match(/\\x22GAE(.*?):S:(.*?)\\x22/g);
  if (!s) {
    return undefined;
  }
  return s[0].replace(/\\\\u003d/g, '=').replace(/\\x22/g, '');
}

function processAndRecur (html, opts, savedApps) {
  const nextToken = getNextToken(html);

  const $ = cheerio.load(html);
  return opts.getParseList(opts)($)
    .then((newApps) => savedApps.concat(newApps))
    .then((apps) => checkFinished(opts, apps, nextToken));
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
  return request(Object.assign({url: buildUrl(opts)}, opts.requestOptions), opts.throttle)
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
    }, opts, {getParseList});

    initialRequest(opts)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = developer;
