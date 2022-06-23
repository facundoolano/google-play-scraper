'use strict';

const url = require('url');
const R = require('ramda');
const scriptData = require('./scriptData');
const { BASE_URL } = require('../constants');

const MAPPINGS = {
  title: [2],
  appId: [12, 0],
  url: {
    path: [9, 4, 2],
    fun: (path) => new url.URL(path, BASE_URL).toString()
  },
  icon: [1, 1, 0, 3, 2],
  developer: [4, 0, 0, 0],
  developerId: {
    path: [4, 0, 0, 1, 4, 2],
    fun: extaractDeveloperId
  },
  priceText: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price) => price === undefined ? 'FREE' : price
  },
  currency: [7, 0, 3, 2, 1, 0, 1],
  price: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price) => price === undefined ? 0 : parseFloat(price.match(/([0-9.,]+)/)[0])
  },
  free: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price) => price === undefined
  },
  summary: [4, 1, 1, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  score: [6, 0, 2, 1, 1]
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
