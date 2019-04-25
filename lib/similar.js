'use strict';

const request = require('./utils/request');
const R = require('ramda');
const url = require('url');
const queryString = require('querystring');
const matchScriptData = require('./utils/matchScriptData');
const PLAYSTORE_URL = 'https://play.google.com/store/apps/details';

function similar (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.appId = encodeURIComponent(opts.appId);
    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';

    const qs = queryString.stringify({
      id: opts.appId,
      hl: opts.lang,
      gl: opts.country
    });
    const reqUrl = `${PLAYSTORE_URL}?${qs}`;

    const options = Object.assign({
      url: reqUrl,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(matchScriptData)
      .then(data => {
        const link = R.path(['ds:6', 1, 1, 0, 0, 3, 4, 2], data);
        if (link === undefined) {
          throw Error('not found similar link');
        }
        return link;
      })
      .then(link => {
        return request(Object.assign({
          url: `https://play.google.com${link}&gl=${opts.country}&hl=${opts.lang}`,
          followAllRedirects: true
        }, opts.requestOptions));
      })
      .then(matchScriptData)
      .then(extractFields)
      .then(data =>
        data.map(e => {
          const q = url.parse(e.developerId, { parseQueryString: true });
          e['developerId'] = q.query['id'];
          e['url'] = new url.URL(e['url'], 'https://play.google.com').toString();
          if (e['priceText'] === undefined) {
            e['free'] = true;
            e['priceText'] = '';
          } else {
            e['free'] = false;
          }
          return e;
        }))
      .then(resolve)
      .catch(reject);
  });
}

/*
 * Map the MAPPINGS object, applying each field spec to the parsed data.
 * If the mapping value is an array, use it as the path to the extract the
 * field's value. If it's an object, extract the value in object.path and pass
 * it to the function in object.fun
 */
function extractFields (parsedData) {
  const input = R.path(['ds:3', 0, 1, 0, 0, 0], parsedData);
  return R.map(data =>
    R.map(spec => R.path(spec, data), MAPPINGS),
  input);
}

const MAPPINGS = {
  title: [2],
  appId: [12, 0],
  url: [9, 4, 2],
  icon: [1, 1, 0, 3, 2],
  developer: [4, 0, 0, 0],
  developerId: [4, 0, 0, 1, 4, 2],
  priceText: [7, 0, 3, 2, 1, 0, 2],
  summary: [4, 1, 1, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  score: [6, 0, 2, 1, 1]
};

module.exports = similar;
