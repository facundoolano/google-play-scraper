import * as R from 'ramda';
import queryString from 'querystring';
import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import helper from './utils/mappingHelpers.js';

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
    path: ['ds:5', 1, 2],
    fun: (val) => helper.descriptionText(helper.descriptionHtmlLocalized(val))
  },
  descriptionHTML: {
    path: ['ds:5', 1, 2],
    fun: helper.descriptionHtmlLocalized
  },
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
  // If there is a discount, originalPrice if filled.
  originalPrice: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 1, 0],
    fun: (price) => price ? price / 1000000 : undefined
  },
  discountEndDate: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 14, 1],
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
  androidMaxVersion: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 1, 1],
    fun: helper.normalizeAndroidVersion
  },
  developer: ['ds:5', 1, 2, 68, 0],
  developerId: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  developerEmail: ['ds:5', 1, 2, 69, 1, 0],
  developerWebsite: ['ds:5', 1, 2, 69, 0, 5, 2],
  developerAddress: ['ds:5', 1, 2, 69, 2, 0],
  developerLegalName: ['ds:5', 1, 2, 69, 4, 0],
  developerLegalEmail: ['ds:5', 1, 2, 69, 4, 1, 0],
  developerLegalAddress: {
    path: ['ds:5', 1, 2, 69],
    fun: (searchArray) => {
      return R.path([4, 2, 0], searchArray)?.replace(/\n/g, ', ');
    }
  },
  developerLegalPhoneNumber: ['ds:5', 1, 2, 69, 4, 3],
  privacyPolicy: ['ds:5', 1, 2, 99, 0, 5, 2],
  developerInternalID: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  genre: ['ds:5', 1, 2, 79, 0, 0, 0],
  genreId: ['ds:5', 1, 2, 79, 0, 0, 2],
  categories: {
    path: ['ds:5', 1, 2],
    fun: (searchArray) => {
      const categories = helper.extractCategories(R.path([118], searchArray));
      if (categories.length === 0) {
        // add genre and genreId like GP does when there're no categories available
        categories.push({
          name: R.path([79, 0, 0, 0], searchArray),
          id: R.path([79, 0, 0, 2], searchArray)
        });
      }
      return categories;
    }
  },
  icon: ['ds:5', 1, 2, 95, 0, 3, 2],
  headerImage: ['ds:5', 1, 2, 96, 0, 3, 2],
  screenshots: {
    path: ['ds:5', 1, 2, 78, 0],
    fun: (screenshots) => {
      if (!screenshots?.length) return [];
      return screenshots.map(R.path([3, 2]));
    }
  },
  video: ['ds:5', 1, 2, 100, 0, 0, 3, 2],
  videoImage: ['ds:5', 1, 2, 100, 1, 0, 3, 2],
  previewVideo: ['ds:5', 1, 2, 100, 1, 2, 0, 2],
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
    path: [],
    isArray: true,
    fun: helper.extractComments
  },
  preregister: {
    path: ['ds:5', 1, 2, 18, 0],
    fun: (val) => val === 1
  },
  earlyAccessEnabled: {
    path: ['ds:5', 1, 2, 18, 2],
    fun: (val) => typeof val === 'string'
  },
  isAvailableInPlayPass: {
    path: ['ds:5', 1, 2, 62],
    fun: (field) => !!field
  }

};

export default app;
