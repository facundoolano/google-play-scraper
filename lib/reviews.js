import * as R from 'ramda';
import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL, constants } from './constants.js';
import createDebug from 'debug';
const debug = createDebug('google-play-scraper:reviews');

function reviews (opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);
    const fullOptions = Object.assign({
      sort: constants.sort.NEWEST,
      lang: 'en',
      country: 'us',
      num: 150,
      paginate: false,
      nextPaginationToken: null
    }, opts);

    processReviews(fullOptions)
      .then(resolve)
      .catch(reject);
  });
}

function validate (opts) {
  if (!opts || !opts.appId) {
    throw Error('appId missing');
  }

  if (opts.sort && !R.includes(opts.sort, R.values(constants.sort))) {
    throw new Error('Invalid sort ' + opts.sort);
  }
}

/**
 * Format the reviews for correct and unified response model
 * @param {array} reviews The reviews to be formated
 * @param {string} token The token to be sent
 */
function formatReviewsResponse ({
  reviews,
  num,
  token = null
}) {
  const reviewsToResponse = (reviews.length >= num)
    ? reviews.slice(0, num)
    : reviews;

  return {
    data: reviewsToResponse,
    nextPaginationToken: token
  };
}

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
 * @param {string} options.appId The app id for reviews
 * @param {number} options.sort The sort order for reviews
 * @param {number} options.numberOfReviewsPerRequest The number of reviews per request
 * @param {string} options.withToken The token to be used for the given request
 * @param {string} options.requestType The request type
 */
function getBodyForRequests ({
  appId,
  sort,
  numberOfReviewsPerRequest = 150,
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

const REQUEST_MAPPINGS = {
  reviews: [0],
  token: [1, 1]
};

// FIXME this looks similar to the processAndRecur from other methods
async function processReviewsAndGetNextPage (html, opts, savedReviews) {
  const processAndRecurOptions = Object.assign({}, opts, { requestType: REQUEST_TYPE.paginated });
  const { appId, paginate, num } = processAndRecurOptions;
  const parsedHtml = R.is(String, html)
    ? scriptData.parse(html)
    : html;

  if (parsedHtml.length === 0) {
    return formatReviewsResponse({ reviews: savedReviews, token: null, num });
  }

  // PROCESS REVIEWS EXTRACTION
  const reviews = extract(REQUEST_MAPPINGS.reviews, parsedHtml, appId);
  const token = R.path(REQUEST_MAPPINGS.token, parsedHtml);
  const reviewsAccumulator = [...savedReviews, ...reviews];

  return (!paginate && token && reviewsAccumulator.length < num)
    ? makeReviewsRequest(processAndRecurOptions, reviewsAccumulator, token)
    : formatReviewsResponse({ reviews: reviewsAccumulator, token, num });
}

/**
 * Make a review request to Google Play Store
 * @param {object} opts The request options
 * @param {array} savedReviews The reviews accumulator array
 * @param {string} nextToken The next page token
 */
function makeReviewsRequest (opts, savedReviews, nextToken) {
  debug('nextToken: %s', nextToken);
  debug('savedReviews length: %s', savedReviews.length);
  debug('requestType: %s', opts.requestType);

  const {
    appId,
    sort,
    requestType,
    lang,
    country,
    requestOptions,
    throttle,
    num
  } = opts;
  const body = getBodyForRequests({
    appId,
    sort,
    withToken: nextToken,
    requestType
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${lang}&gl=${country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const reviewRequestOptions = Object.assign({
    url,
    method: 'POST',
    body,
    followRedirect: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, requestOptions);

  return request(reviewRequestOptions, throttle)
    .then((html) => {
      const input = JSON.parse(html.substring(5));
      const data = JSON.parse(input[0][2]);

      return (data === null)
        ? formatReviewsResponse({ reviews: savedReviews, token: null, num })
        : processReviewsAndGetNextPage(data, opts, savedReviews);
    });
}

/**
 * Process the reviews for a given app
 * @param {object} opts The options for reviews behavior
 */
function processReviews (opts) {
  const requestType = (!opts.nextPaginationToken)
    ? REQUEST_TYPE.initial
    : REQUEST_TYPE.paginated;
  const token = opts.nextPaginationToken || '%token%';

  const reviewsOptions = Object.assign({}, { requestType }, opts);
  return makeReviewsRequest(reviewsOptions, [], token);
}

function getReviewsMappings (appId) {
  const MAPPINGS = {
    id: [0],
    userName: [1, 0],
    userImage: [1, 1, 3, 2],
    date: {
      path: [5],
      fun: generateDate
    },
    score: [2],
    scoreText: {
      path: [2],
      fun: (score) => String(score)
    },
    url: {
      path: [0],
      fun: (reviewId) => `${BASE_URL}/store/apps/details?id=${appId}&reviewId=${reviewId}`
    },
    title: {
      path: [0],
      fun: () => null
    },
    text: [4],
    replyDate: {
      path: [7, 2],
      fun: generateDate
    },
    replyText: {
      path: [7, 1],
      fun: (text) => text || null
    },
    version: {
      path: [10],
      fun: (version) => version || null
    },
    thumbsUp: [6],
    criterias: {
      path: [12, 0],
      fun: (criterias = []) => criterias.map(buildCriteria)
    }
  };

  return MAPPINGS;
}

const buildCriteria = (criteria) => ({
  criteria: criteria[0],
  rating: criteria[1] ? criteria[1][0] : null
});

function generateDate (dateArray) {
  if (!dateArray) {
    return null;
  }

  const millisecondsLastDigits = String(dateArray[1] || '000');
  const millisecondsTotal = `${dateArray[0]}${millisecondsLastDigits.substring(0, 3)}`;
  const date = new Date(Number(millisecondsTotal));

  return date.toJSON();
}

/*
 * Apply MAPPINGS for each application in list from root path
*/
function extract (root, data, appId) {
  const input = R.path(root, data);
  const MAPPINGS = getReviewsMappings(appId);
  return R.map(scriptData.extractor(MAPPINGS), input);
}

export default reviews;
