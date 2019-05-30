'use strict';

var url = require('url');
var R = require('ramda');
var querystring = require('querystring');
var scriptData = require('./scriptData');

var MAPPINGS = {
  title: [2],
  appId: [12, 0],
  url: {
    path: [9, 4, 2],
    fun: function fun(path) {
      return new url.URL(path, 'https://play.google.com').toString();
    }
  },
  icon: [1, 1, 0, 3, 2],
  developer: [4, 0, 0, 0],
  developerId: {
    path: [4, 0, 0, 1, 4, 2],
    fun: extaractDeveloperId
  },
  priceText: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: function fun(price) {
      return price === undefined ? 'FREE' : price;
    }
  },
  free: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: function fun(price) {
      return price === undefined;
    }
  },
  summary: [4, 1, 1, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  score: [6, 0, 2, 1, 1]
};

function extaractDeveloperId(link) {
  return querystring.parse(link.split('?')[1]).id;
}

/*
 * Apply MAPPINGS for each application in list from root path
*/

function extract(root, data) {
  var input = R.path(root, data);
  return R.map(scriptData.extractor(MAPPINGS), input);
}

module.exports = { MAPPINGS: MAPPINGS, extract: extract };