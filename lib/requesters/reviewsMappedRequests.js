'use strict';

const debug = require('debug')('google-play-scraper:reviewsMappedRequests');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const reviewsList = require('../utils/reviewsList');
const { REQUEST_MAPPINGS } = require('../mappers/request');
const { BASE_URL } = require('../utils/configurations');

const TOKEN_TYPES = {
  initial: 'initial',
  request: 'request'
};

function getBodyForRequests ({
  appId,
  sort,
  numberOfReviews = 100,
  withToken = '%token%',
  tokenType = 'initial'
}) {
  const formBody = {
    initial: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviews}%2Cnull%2Cnull%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`,
    request: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviews}%2Cnull%2C%5C%22${withToken}%5C%22%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`
  };

  return formBody[tokenType];
}

async function processAndRecur (html, opts, savedReviews, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  const reviews = reviewsList.extract(mappings.reviews, html, opts.appId);
  const token = R.path(mappings.reviewsToken, html);
  opts.tokenType = TOKEN_TYPES.request;

  return checkFinished(opts, [...savedReviews, ...reviews], token);
}

function checkFinished (opts, savedReviews, nextToken) {
  if (savedReviews.length >= opts.num || !nextToken) {
    return savedReviews.slice(0, opts.num);
  }

  const body = getBodyForRequests({
    appId: opts.appId,
    sort: opts.sort,
    numberOfReviews: opts.numberOfReviews,
    withToken: nextToken
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${opts.lang}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const requestOptions = Object.assign({
    url,
    method: 'POST',
    body,
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => {
      const input = JSON.parse(html.substring(5));
      const data = JSON.parse(input[0][2]);

      return (data === null)
        ? savedReviews
        : processAndRecur(data, opts, savedReviews, REQUEST_MAPPINGS);
    });
}

function processFullReviews (opts) {
  opts.tokenType = TOKEN_TYPES.initial;
  return checkFinished(opts, [], '%token%');
}

module.exports = {
  processFullReviews
};
