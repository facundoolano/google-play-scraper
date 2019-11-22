'use strict';

const debug = require('debug')('google-play-scraper:reviewsMappedRequests');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const reviewsList = require('../utils/reviewsList');
const { REQUEST_MAPPINGS } = require('../mappers/reviews');
const { BASE_URL } = require('../utils/configurations');

/**
 * This object allow us to differ between
 * the initial body request and the paginated ones
 */
const REQUEST_TYPE = {
  initial: 'initial',
  paginated: 'paginated'
};

/**
 * This method allow us to get the body for the review request
 *
 * @param options.appId The app id for reviews
 * @param options.sort The sort order for reviews
 * @param options.numberOfReviewsPerRequest The number of reviews per request
 * @param options.withToken The token to be used for the given request
 * @param options.requestType The
 */
function getBodyForRequests ({
  appId,
  sort,
  numberOfReviewsPerRequest = 100,
  withToken = '%token%',
  requestType = REQUEST_TYPE.initial
}) {
  /* The body is slight different for the initial and paginated requests */
  const formBody = {
    [REQUEST_TYPE.initial]: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviewsPerRequest}%2Cnull%2Cnull%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`,
    [REQUEST_TYPE.paginated]: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviewsPerRequest}%2Cnull%2C%5C%22${withToken}%5C%22%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`
  };

  return formBody[requestType];
}

async function processAndRecur (html, opts, savedReviews, mappings) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  if (html.length === 0) {
    return savedReviews;
  }

  const reviews = reviewsList.extract(mappings.reviews, html, opts.appId);
  const token = R.path(mappings.token, html);
  opts.requestType = REQUEST_TYPE.paginated;

  return checkFinished(opts, [...savedReviews, ...reviews], token);
}

function checkFinished (opts, savedReviews, nextToken) {
  debug('nextToken: %s', nextToken);
  debug('savedReviews length: %s', savedReviews.length);
  debug('requestType: %s', opts.requestType);

  if (savedReviews.length >= opts.num || !nextToken) {
    return savedReviews.slice(0, opts.num);
  }

  const body = getBodyForRequests({
    appId: opts.appId,
    sort: opts.sort,
    withToken: nextToken,
    requestType: opts.requestType
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${opts.lang}&gl=${opts.country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

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
  opts.requestType = REQUEST_TYPE.initial;
  return checkFinished(opts, [], '%token%');
}

module.exports = {
  processFullReviews
};
