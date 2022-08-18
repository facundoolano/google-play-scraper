'use strict';

const R = require('ramda');
const queryString = require('querystring');
const request = require('./utils/request');
const scriptData = require('./utils/scriptData');
const { BASE_URL } = require('./constants');
const helper = require('./utils/mappingHelpers');

const PLAYSTORE_URL = `${BASE_URL}/store/apps/details`;

function app (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

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
      followRedirect: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(scriptData.parse)
    // comment next line to get raw data
      .then(scriptData.extractor(MAPPINGS))
      .then(R.assoc('appId', opts.appId))
      .then(R.assoc('url', reqUrl))
      .then(resolve)
      .catch(reject);
  });
}

const MAPPINGS = {
  title: ['ds:5', 1, 2, 0, 0],
  description: {
    path: ['ds:5', 1, 2, 72, 0, 1],
    fun: helper.descriptionText
  },
  descriptionHTML: ['ds:5', 1, 2, 72, 0, 1],
  summary: ['ds:5', 1, 2, 73, 0, 1],
  installs: ['ds:5', 1, 2, 13, 0],
  minInstalls: ['ds:5', 1, 2, 13, 1],
  maxInstalls: ['ds:5', 1, 2, 13, 2],
  score: ['ds:5', 1, 2, 51, 0, 1],
  scoreText: ['ds:5', 1, 2, 51, 0, 0],
  ratings: ['ds:5', 1, 2, 51, 2, 1],
  reviews: ['ds:5', 1, 2, 51, 3, 1],
  histogram: {
    path: ['ds:5', 1, 2, 51, 1],
    fun: helper.buildHistogram
  },
  price: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 0],
    fun: (val) => val / 1000000 || 0
  },
  free: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 0],
    // considered free only if price is exactly zero
    fun: (val) => val === 0
  },
  currency: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 1],
  priceText: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 2],
    fun: helper.priceText
  },
  available: {
    path: ['ds:5', 1, 2, 18, 0],
    fun: Boolean
  },
  offersIAP: {
    path: ['ds:5', 1, 2, 19, 0],
    fun: Boolean
  },
  IAPRange: ['ds:5', 1, 2, 19, 0],
  androidVersion: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 0, 1],
    fun: helper.normalizeAndroidVersion
  },
  androidVersionText: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 0, 1],
    fun: (version) => version || 'Varies with device'
  },
  developer: ['ds:5', 1, 2, 68, 0],
  developerId: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  developerEmail: ['ds:5', 1, 2, 69, 1, 0],
  developerWebsite: ['ds:5', 1, 2, 69, 0, 5, 2],
  developerAddress: ['ds:5', 1, 2, 69, 2, 0],
  privacyPolicy: ['ds:5', 1, 2, 99, 0, 5, 2],
  developerInternalID: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  genre: ['ds:5', 1, 2, 79, 0, 0, 0],
  genreId: ['ds:5', 1, 2, 79, 0, 0, 2],
  familyGenre: ['ds:5', 0, 12, 13, 1, 0],
  familyGenreId: ['ds:5', 0, 12, 13, 1, 2],
  icon: ['ds:5', 1, 2, 95, 0, 3, 2],
  headerImage: ['ds:5', 1, 2, 96, 0, 3, 2],
  screenshots: {
    path: ['ds:5', 1, 2, 78, 0],
    fun: (screenshots) => {
      if (screenshots === null) return [];
      return screenshots.map(R.path([3, 2]));
    }
  },
  video: ['ds:5', 1, 2, 100, 0, 0, 3, 2],
  videoImage: ['ds:5', 1, 2, 100, 1, 0, 3, 2],
  contentRating: ['ds:5', 1, 2, 9, 0],
  contentRatingDescription: ['ds:5', 1, 2, 9, 2, 1],
  adSupported: {
    path: ['ds:5', 1, 2, 48],
    fun: Boolean
  },
  released: ['ds:5', 1, 2, 10, 0],
  updated: {
    path: ['ds:5', 1, 2, 145, 0, 1, 0],
    fun: (ts) => ts * 1000
  },
  version: {
    path: ['ds:5', 1, 2, 140, 0, 0, 0],
    fun: (val) => val || 'VARY'
  },
  recentChanges: ['ds:5', 1, 2, 144, 1, 1],
  comments: {
    path: ['ds:9', 0],
    isArray: true,
    fun: helper.extractComments
  }
};

module.exports = app;
