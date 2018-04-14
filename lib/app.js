'use strict';

const request = require('./utils/request');
const queryString = require('querystring');
const cheerio = require('cheerio');
const R = require('ramda');

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details';

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
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(matchScriptData)
    // comment next line to get raw data
      .then(extractFields)
      .then(R.assoc('appId', opts.appId))
      .then(R.assoc('url', reqUrl))
      .then(resolve)
      .catch(reject);
  });
}

/*
 * Extract the javascript objects returned by the AF_initDataCallback functions
 * in the script tags of the app detail HTML.
 */
function matchScriptData (response) {
  const scriptRegex = />AF_initDataCallback[\s\S]*?<\/script/g;
  const keyRegex = /(ds:.*?)'/;
  const valueRegex = /return ([\s\S]*?)}}\);<\//;

  return response.match(scriptRegex)
    .reduce((accum, data) => {
      const keyMatch = data.match(keyRegex);
      const valueMatch = data.match(valueRegex);

      if (keyMatch && valueMatch) {
        const key = keyMatch[1];
        const value = JSON.parse(valueMatch[1]);
        return R.assoc(key, value, accum);
      }
      return accum;
    }, {});
}

// TODO may need to do html to text in some of the fields

const MAPPINGS = {
  // FIXME add appId

  title: ['ds:3', 0, 0, 0],
  description: {
    path: ['ds:3', 0, 10, 0, 1],
    fun: descriptionText
  },
  descriptionHTML: ['ds:3', 0, 10, 0, 1],
  summary: ['ds:3', 0, 10, 1, 1],
  installs: ['ds:3', 0, 12, 9, 0],
  minInstalls: {
    path: ['ds:3', 0, 12, 9, 0],
    fun: cleanInt
  },
  score: ['ds:10', 0, 0, 1],
  scoreText: ['ds:10', 0, 0, 0],
  ratings: ['ds:10', 0, 2, 1],
  reviews: ['ds:10', 0, 3, 1],
  histogram: {
    path: ['ds:10', 0, 1],
    fun: buildHistogram
  },

  price: {
    path: ['ds:8', 0, 2, 0, 0, 0, 1, 0, 0],
    fun: (val) => val / 1000000 || 0
  },
  free: {
    path: ['ds:8', 0, 2, 0, 0, 0, 1, 0, 0],
    // considered free only if prize is exactly zero
    fun: (val) => val === 0
  },
  currency: ['ds:8', 0, 2, 0, 0, 0, 1, 0, 1],
  priceText: ['ds:8', 0, 2, 0, 0, 0, 1, 0, 2],
  offersIAP: {
    path: ['ds:3', 0, 12, 12, 0],
    fun: Boolean
  },

  size: ['ds:5', 0],
  androidVersion: {
    path: ['ds:5', 2],
    fun: normalizeAndroidVersion
  },
  androidVersionText: ['ds:5', 2],

  developer: ['ds:3', 0, 12, 5, 1],
  developerId: {
    path: ['ds:3', 0, 12, 5, 5, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  developerEmail: ['ds:3', 0, 12, 5, 2, 0],
  developerWebsite: ['ds:3', 0, 12, 5, 3, 5, 2],
  developerAddress: ['ds:3', 0, 12, 5, 4, 0],

  genre: ['ds:3', 0, 12, 13, 0, 0],
  genreId: ['ds:3', 0, 12, 13, 0, 2],
  familyGenre: ['ds:3', 0, 12, 13, 1, 0],
  familyGenreId: ['ds:3', 0, 12, 13, 1, 2],

  icon: ['ds:3', 0, 12, 1, 3, 2],
  headerImage: ['ds:3', 0, 12, 2, 3, 2],
  screenshots: {
    path: ['ds:3', 0, 12, 0],
    fun: R.map(R.path([3, 2]))
  },
  video: ['ds:3', 0, 12, 3, 0, 3, 2],
  videoImage: ['ds:3', 0, 12, 3, 1, 3, 2],

  contentRating: ['ds:3', 0, 12, 4, 0],
  contentRatingDescription: ['ds:3', 0, 12, 4, 2, 1],
  adSupported: {
    path: ['ds:3', 0, 12, 14, 0],
    fun: Boolean
  },

  released: ['ds:3', 0, 12, 36],
  updated: {
    path: ['ds:3', 0, 12, 8, 0],
    fun: (ts) => ts * 1000
  },

  version: ['ds:5', 1],
  recentChanges: ['ds:3', 0, 12, 6, 1],
  comments: {
    path: ['ds:13', 0],
    fun: extractComments
  }

};

/*
 * Map the MAPPINGS object, applying each field spec to the parsed data.
 * If the mapping value is an array, use it as the path to the extract the
 * field's value. If it's an object, extract the value in object.path and pass
 * it to the function in object.fun
 */
function extractFields (parsedData) {
  return R.map((spec) => {
    if (R.is(Array, spec)) {
      return R.path(spec, parsedData);
    }
    // assume spec object
    const input = R.path(spec.path, parsedData);
    return spec.fun(input);
  }, MAPPINGS);
}

function descriptionText (description) {
  // preserve the line breaks when converting to text
  const html = cheerio.load('<div>' + description.replace(/<br>/g, '\r\n') + '</div>');
  return cheerio.text(html('div'));
}

function cleanInt (number) {
  number = number || '0';
  number = number.replace(/[^\d]/g, ''); // removes thousands separator
  return parseInt(number);
}

function normalizeAndroidVersion (androidVersionText) {
  const number = androidVersionText.split(' ')[0];
  if (parseFloat(number)) {
    return number;
  }
  return 'VARY';
}

function buildHistogram (container) {
  if (!container) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
  return {
    1: container[1][1],
    2: container[2][1],
    3: container[3][1],
    4: container[4][1],
    5: container[5][1]
  };
}

function extractComments (comments) {
  if (!comments) {
    return [];
  }
  return R.compose(
    R.take(5),
    R.reject(R.isNil),
    R.pluck(3))(comments);
}

module.exports = app;
