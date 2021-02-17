'use strict';

const c = require('../constants');

const MAPPINGS = {
  collections: {
    top: {
      2: {
        [c.collection.TOP_FREE]: 0,
        [c.collection.TOP_PAID]: 1
      },
      3: {
        [c.collection.TOP_FREE]: 0,
        [c.collection.TOP_PAID]: 1,
        [c.collection.GROSSING]: 2
      },
      4: {
        [c.collection.TOP_FREE]: 0,
        [c.collection.GROSSING]: 1,
        [c.collection.TRENDING]: 2,
        [c.collection.TOP_PAID]: 3
      },
      6: {
        [c.collection.TOP_FREE]: 0,
        [c.collection.TOP_PAID]: 1,
        [c.collection.GROSSING]: 2,
        [c.collection.TOP_FREE_GAMES]: 3,
        [c.collection.TOP_PAID_GAMES]: 4,
        [c.collection.TOP_GROSSING_GAMES]: 5
      }
    },
    new: {
      1: {
        [c.collection.NEW_FREE]: 0
      },
      2: {
        [c.collection.NEW_FREE]: 0,
        [c.collection.NEW_PAID]: 1
      },
      4: {
        [c.collection.NEW_FREE]: 0,
        [c.collection.NEW_PAID]: 1,
        [c.collection.NEW_FREE_GAMES]: 2,
        [c.collection.NEW_PAID_GAMES]: 3
      }
    }
  },
  clusterUrl: [0, 3, 4, 2]
};

module.exports = {
  MAPPINGS
};
