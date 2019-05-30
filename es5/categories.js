'use strict';

var request = require('./utils/request');
var cheerio = require('cheerio');

var PLAYSTORE_URL = 'https://play.google.com/store/apps';
var CATEGORY_URL_PREFIX = 'https://play.google.com/store/apps/category/';

function categories(opts) {
  opts = Object.assign({}, opts);

  return new Promise(function (resolve, reject) {
    var options = Object.assign({
      url: PLAYSTORE_URL
    }, opts.requestOptions);

    request(options, opts.throttle).then(cheerio.load).then(extractCategories).then(resolve).catch(reject);
  });
}

function extractCategories($) {
  var categoryIds = $('ul li a').toArray().map(function (el) {
    return $(el).attr('href');
  }).filter(function (url) {
    return url.startsWith(CATEGORY_URL_PREFIX) && !url.includes('?age=');
  }).map(function (url) {
    return url.substr(CATEGORY_URL_PREFIX.length);
  });
  categoryIds.push('APPLICATION');

  return categoryIds;
}

module.exports = categories;