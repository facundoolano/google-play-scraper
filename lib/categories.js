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
      .then(extractCategories)
      .then(resolve)
      .catch(reject);
  });
}

function extractCategories (body) {
  const $ = cheerio.load(body);
  const childLinks = $('.child-submenu-link')
    .map((i, el) => $(el).attr('href'))
    .get();
  const parentLinks = $('.parent-submenu-link')
    .map((i, el) => $(el).attr('href'))
    .get();
  const everyLink = parentLinks.concat(childLinks);

  const categoryIds = [];
  for (let link of everyLink) {
    if (!link.startsWith(CATEGORY_URL_PREFIX)) {
      continue;
    }

    if (link.includes('?age=')) {
      continue;
    }

    categoryIds.push(link.substr(CATEGORY_URL_PREFIX.length));
  }

  categoryIds.push('APPLICATION');

  return categoryIds;
}

module.exports = categories;
