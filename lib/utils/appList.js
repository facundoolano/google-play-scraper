'use strict';

const url = require('url');
const R = require('ramda');
const scriptData = require('./scriptData');
const { BASE_URL } = require('../constants');

const MAPPINGS = {
  title: [0, 3],
  appId: [0, 0, 0],
  url: {
    path: [0, 10, 4, 2],
    fun: (path) => new url.URL(path, BASE_URL).toString()
  },
  icon: [0, 1, 3, 2],
  developer: [0, 14],
  developerId: [0, 14],
  //   path: [4, 0, 0, 1, 4, 2],
  //   fun: extaractDeveloperId
  // },
  priceText: {
    path: [0, 8, 1, 0],
    fun: (price) => price[0] === 0 ? 'FREE' : price[1] + ' ' + price[0]
  },
  currency: [0, 8, 1, 0, 1],
  price: [0, 8, 1, 0, 0],
  free: {
    path: [0, 8, 1, 0, 0],
    fun: (price) => price === 0
  },
  summary: [0, 13, 1],
  scoreText: [0, 4, 0],
  score: [0, 4, 1]
};

function extaractDeveloperId (link) {
  return link.split('?id=')[1];
}

/*
 * Apply MAPPINGS for each application in list from root path
*/

function extract (root, data) {
  const input = R.path(root, data);
  if (input === undefined) return [];
  return R.map(scriptData.extractor(MAPPINGS), input);
}

module.exports = { MAPPINGS, extract };
