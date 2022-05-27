const R = require('ramda');
const helper = require('../../utils/mappingHelpers');

module.exports = {
  // FIXME add appId
  title: ['ds:5', 0, 0, 0],
  description: {
    path: ['ds:5', 0, 10, 0, 1],
    fun: helper.descriptionText
  },
  descriptionHTML: ['ds:5', 0, 10, 0, 1],
  summary: ['ds:5', 0, 10, 1, 1],
  installs: ['ds:5', 0, 12, 9, 0],
  minInstalls: ['ds:5', 0, 12, 9, 1],
  maxInstalls: ['ds:5', 0, 12, 9, 2],
  score: ['ds:6', 0, 6, 0, 1],
  scoreText: ['ds:6', 0, 6, 0, 0],
  ratings: ['ds:6', 0, 6, 2, 1],
  reviews: ['ds:6', 0, 6, 3, 1],
  histogram: {
    path: ['ds:6', 0, 6, 1],
    fun: helper.buildHistogram
  },

  price: {
    path: ['ds:3', 0, 2, 0, 0, 0, 1, 0, 0],
    fun: (val) => val / 1000000 || 0
  },
  free: {
    path: ['ds:3', 0, 2, 0, 0, 0, 1, 0, 0],
    // considered free only if price is exactly zero
    fun: (val) => val === 0
  },
  currency: ['ds:3', 0, 2, 0, 0, 0, 1, 0, 1],
  priceText: {
    path: ['ds:3', 0, 2, 0, 0, 0, 1, 0, 2],
    fun: helper.priceText
  },
  available: {
    path: ['ds:5', 0, 12, 11, 0],
    fun: Boolean
  },
  offersIAP: {
    path: ['ds:5', 0, 12, 12, 0],
    fun: Boolean
  },
  IAPRange: ['ds:5', 0, 12, 12, 0],
  size: ['ds:8', 0],
  androidVersion: {
    path: ['ds:8', 2],
    fun: helper.normalizeAndroidVersion
  },
  androidVersionText: ['ds:8', 2],
  developer: ['ds:5', 0, 12, 5, 1],
  developerId: {
    path: ['ds:5', 0, 12, 5, 5, 4, 2],
    fun: (devUrl) => devUrl.split('id=')[1]
  },
  developerEmail: ['ds:5', 0, 12, 5, 2, 0],
  developerWebsite: ['ds:5', 0, 12, 5, 3, 5, 2],
  developerAddress: ['ds:5', 0, 12, 5, 4, 0],
  privacyPolicy: ['ds:5', 0, 12, 7, 2],
  developerInternalID: ['ds:5', 0, 12, 5, 0, 0],
  genre: ['ds:5', 0, 12, 13, 0, 0],
  genreId: ['ds:5', 0, 12, 13, 0, 2],
  familyGenre: ['ds:5', 0, 12, 13, 1, 0],
  familyGenreId: ['ds:5', 0, 12, 13, 1, 2],
  icon: ['ds:5', 0, 12, 1, 3, 2],
  headerImage: ['ds:5', 0, 12, 2, 3, 2],
  screenshots: {
    path: ['ds:5', 0, 12, 0],
    fun: (screenshots) => {
      if (screenshots === null) return [];
      return screenshots.map(R.path([3, 2]));
    }
  },
  video: ['ds:5', 0, 12, 3, 0, 3, 2],
  videoImage: ['ds:5', 0, 12, 3, 1, 3, 2],
  contentRating: ['ds:5', 0, 12, 4, 0],
  contentRatingDescription: ['ds:5', 0, 12, 4, 2, 1],
  adSupported: {
    path: ['ds:5', 0, 12, 14, 0],
    fun: Boolean
  },
  released: ['ds:5', 0, 12, 36],
  updated: {
    path: ['ds:5', 0, 12, 8, 0],
    fun: (ts) => ts * 1000
  },
  version: ['ds:8', 1],
  recentChanges: ['ds:5', 0, 12, 6, 1],
  comments: {
    useServiceRequestId: 'UsvDTd',
    path: [0],
    fun: helper.extractComments
  },
  editorsChoice: {
    path: ['ds:5', 0, 12, 15, 0],
    fun: Boolean
  },
  features: {
    path: ['ds:5', 0, 12, 16],
    fun: helper.extractFeatures
  }
};
