'use strict';

const url = require('url');
const R = require('ramda');
const scriptData = require('./scriptData');
const { BASE_URL } = require('../constants');

const MAPPINGS = {
  title: [0, 3],
  appId: [0, 0, 0],
  url: {
    path: [0, 8, 6, 5, 2],
    fun: (path) => new url.URL(path, BASE_URL).toString()
  },
  icon: [0, 1, 3, 2],
  developer: [0, 14],
  priceText: {
    path: [0, 8, 1, 0, 2],
    fun: (price) => price === undefined ? 'FREE' : price
  },
  currency: [7, 0, 3, 2, 1, 0, 1],
  price: {
    path: [0, 8, 1, 0, 2],
    fun: (price) => price === undefined || price === 0 || price === '' ? 0 : parseFloat(price.match(/([0-9.,]+)/)[0])
  },
  free: {
    path: [0, 8, 1, 0, 2],
    fun: (price) => price === undefined || price === ''
  },
  summary: [0, 13, 1],
  scoreText: [0, 4, 0],
  score: [0, 4, 1]
};

function extractDeveloperId (link) {
  return link;
  return link.split('?id=')[1];
}

/*
 * Apply MAPPINGS for each application in list from root path
*/

function extract (root, rootAlt, data) {
  let input = R.path(root, data);
  
  if (input === undefined) 
    input = R.path(rootAlt, data);
  
  if (input === undefined) return [];
  
  return R.map(scriptData.extractor(MAPPINGS), input);
}

module.exports = { MAPPINGS, extract, extractDeveloperId };
