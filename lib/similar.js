'use strict';

const request = require('./utils/request');
const R = require('ramda');
const url = require('url');
const queryString = require('querystring');
const scriptData = require('./utils/scriptData');

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
      .then(scriptData.parse)
      .then(scriptData.extractor(PATH_MAPPING))
      .then(data => {
        if (data.path === undefined) {
          throw Error('not found similar link');
        }
        return request(Object.assign({
          url: `https://play.google.com${data.path}&gl=${opts.country}&hl=${opts.lang}`,
          followAllRedirects: true
        }, opts.requestOptions));
      })
      .then(scriptData.parse)
      .then(data => {
        const input = R.path(['ds:3', 0, 1, 0, 0, 0], data);
        return R.map(scriptData.extractor(MAPPINGS), input);
      })
      .then(resolve)
      .catch(reject);
  });
}

const PATH_MAPPING = {
  path: ['ds:6', 1, 1, 0, 0, 3, 4, 2]
};

/*
 * Map the MAPPINGS object, applying each field spec to the parsed data.
 * If the mapping value is an array, use it as the path to the extract the
 * field's value. If it's an object, extract the value in object.path and pass
 * it to the function in object.fun
*/

const MAPPINGS = {
  title: [2],
  appId: [12, 0],
  url: {
    path: [9, 4, 2],
    fun: (path) => new url.URL(path, 'https://play.google.com').toString()
  },
  icon: [1, 1, 0, 3, 2],
  developer: [4, 0, 0, 0],
  developerId: {
    path: [4, 0, 0, 1, 4, 2],
    fun: extractDeveloperId
  },
  priceText: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price) => price === undefined ? 'FREE' : price
  },
  free: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price) => price === undefined
  },
  summary: [4, 1, 1, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  score: [6, 0, 2, 1, 1]
};

function extractDeveloperId (link) {
  const q = url.parse(link, { parseQueryString: true });
  return q.query['id'];
}

module.exports = similar;
