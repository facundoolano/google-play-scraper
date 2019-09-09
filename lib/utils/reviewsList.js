'use strict';

const R = require('ramda');
const scriptData = require('./scriptData');
const { BASE_URL } = require('./configurations');

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
    version: [10],
    thumbsUp: [6]
  };

  return MAPPINGS;
}

function generateDate (dateArray) {
  if (!dateArray) {
    return null;
  }

  const millisecondsTotal = `${dateArray[0]}${String(dateArray[1]).substring(0, 3)}`;
  const time = new Date(Number(millisecondsTotal));

  return String(time);
}

/*
 * Apply MAPPINGS for each application in list from root path
*/
function extract (root, data, appId) {
  const input = R.path(root, data);
  const MAPPINGS = getReviewsMappings(appId);
  return R.map(scriptData.extractor(MAPPINGS), input);
}

module.exports = { getReviewsMappings, extract };