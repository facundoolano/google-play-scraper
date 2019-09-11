'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');

const PLAYSTORE_URL = 'https://play.google.com/store/apps';
const CATEGORY_URL_PREFIX = '/store/apps/category/';

function categories (opts) {
  opts = Object.assign({}, opts);

  return new Promise(function (resolve, reject) {
    const options = Object.assign(
      {
        url: PLAYSTORE_URL
      },
      opts.requestOptions
    );

    request(options, opts.throttle)
      .then(cheerio.load)
      .then(extractCategories)
      .then(resolve)
      .catch(reject);
  });
}

function extractCategories ($) {
  const categoryIds = $('ul li a')
    .toArray()
    .map((el) => $(el).attr('href'))
    .filter((url) => url.startsWith(CATEGORY_URL_PREFIX) && !url.includes('?age='))
    .map((url) => url.substr(CATEGORY_URL_PREFIX.length));
  categoryIds.push('APPLICATION');

  return categoryIds;
}

module.exports = categories;
