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

  if (opts.stars != null && !R.includes(opts.stars, [1, 2, 3, 4, 5])) {
    throw new Error('Invalid stars ' + opts.stars + ', expected a number from 1 to 5');
  }

  if (opts.sentiment != null && !R.includes(opts.sentiment, R.values(constants.sentiment))) {
    throw new Error('Invalid sentiment ' + opts.sentiment);
  }

  if (opts.stars != null && opts.sentiment != null) {
    throw new Error('Use either stars or sentiment, not both');
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

const RPC_ID = 'oCPfdb';

/**
 * Build the batchexecute form body for a reviews request.
 *
 * @param {string} options.appId The app id for reviews
 * @param {number} options.sort The sort order for reviews
 * @param {number} options.numberOfReviewsPerRequest The number of reviews per request
 * @param {string|null} options.token The continuation token, or null for the first page
 * @param {number} [options.stars] Only reviews with this star rating (1-5)
 * @param {number} [options.sentiment] Only positive (4-5 stars) or critical (1-3 stars) reviews
 */
function getBodyForRequests ({
  appId,
  sort,
  numberOfReviewsPerRequest = 150,
  token = null,
  stars = null,
  sentiment = null
}) {
  const paging = token ? [numberOfReviewsPerRequest, null, token] : [numberOfReviewsPerRequest];
  const filters = [null, stars, null, null, null, null, sentiment, null, null];
  const request = [null, [2, sort, paging, null, filters], [appId, 7]];
  const envelope = [[[RPC_ID, JSON.stringify(request), null, 'generic']]];
  return `f.req=${encodeURIComponent(JSON.stringify(envelope))}`;
}

const REQUEST_MAPPINGS = {
  reviews: [0],
  token: [1, 1]
};

// FIXME this looks similar to the processAndRecur from other methods
async function processReviewsAndGetNextPage (html, opts, savedReviews) {
  const { appId, paginate, num } = opts;
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
    ? makeReviewsRequest(opts, reviewsAccumulator, token)
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

  const {
    appId,
    sort,
    lang,
    country,
    requestOptions,
    throttle,
    num,
    stars,
    sentiment
  } = opts;
  const body = getBodyForRequests({
    appId,
    sort,
    token: nextToken,
    stars,
    sentiment
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=${RPC_ID}&hl=${lang}&gl=${country}`;

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
  const token = opts.nextPaginationToken || null;
  return makeReviewsRequest(opts, [], token);
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
  const input = R.path(root, data) || [];
  const MAPPINGS = getReviewsMappings(appId);
  return R.map(scriptData.extractor(MAPPINGS), input);
}

export default reviews;
