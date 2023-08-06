import request from './utils/request.js';
import * as cheerio from 'cheerio';
import { BASE_URL } from './constants.js';

const PLAYSTORE_URL = `${BASE_URL}/store/apps`;
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

export default categories;
