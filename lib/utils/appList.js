'use strict';

const url = require('url');
const R = require('ramda');
const scriptData = require('./scriptData');
const { BASE_URL } = require('../constants');

const MAPPINGS = {
  title: [0, 3],
  appId: [0, 0, 0],
  url: {
    path: [0, 10, 4, 2],
    fun: (path) => new url.URL(path, BASE_URL).toString()
  },
  icon: [0, 1, 3, 2],
  developer: [0, 14],
  developerId: [0, 14],
  //   path: [4, 0, 0, 1, 4, 2],
  //   fun: extaractDeveloperId
  // },
  priceText: {
    path: [0, 8, 1, 0],
    fun: (price) => (price === undefined || price[0] === 0) ? 'FREE' : price[1] + ' ' + price[0]
  },
  currency: [0, 8, 1, 0, 1],
  price: [0, 8, 1, 0, 0],
  free: {
    path: [0, 8, 1, 0, 0],
    fun: (price) => price === 0
  },
  summary: [0, 13, 1],
  scoreText: [0, 4, 0],
  score: [0, 4, 1]
};

// function extaractDeveloperId (link) {
//   return link.split('?id=')[1];
// }

const isArray = (array) => Array.isArray(array) && typeof array !== 'string';

const isApp = (app) => {
  return R.path(MAPPINGS.appId, app) !== null &&
    R.path(MAPPINGS.title, app) !== null;
};

const mapArrayLengthAsValueRecrusive = (rootArray, deep = 0, path = [], results = []) => {
  if (deep > 5) {
    return results;
  }

  if (rootArray === undefined) {
    return results;
  }

  if (isArray(rootArray)) {
    for (let i = 0; i < rootArray.length; i++) {
      if (isArray(rootArray[i])) {
        results.push({ path: [...path, i], value: rootArray[i].length });
        results = mapArrayLengthAsValueRecrusive(rootArray[i], deep + 1, [...path, i], results);
      }
    }
  }

  return results.filter(({ value }) => value > 0);
};

function findMoreResultsMapping (html, basePath) {
  const results = R.path(basePath, html);

  const arrayToCheck = mapArrayLengthAsValueRecrusive(results).filter(({ value }) => value > 100);

  for (let i = 0; i < arrayToCheck.length; i++) {
    const { path } = arrayToCheck[i];

    const app = R.path([...basePath, ...path], html);

    if (app && isApp([app])) {
      const apps = R.path([...basePath, ...path.slice(0, path.length - 2)], html);
      const token = R.path([...basePath, ...path.slice(0, path.length - 3), ...[1, 3, 1]], html);

      return { apps, token };
    }
  }
}
/*
 * Apply MAPPINGS for each application in list from root path
*/

function extract (rootPath, resultsBasePath, data) {
  let input = R.path(rootPath, data);

  if (input === undefined) {
    // Check for more results
    const { apps, token } = findMoreResultsMapping(data, resultsBasePath);

    if (apps === undefined) {
      return [];
    }

    return { results: R.map(scriptData.extractor(MAPPINGS), apps), token };
  }

  return { results: R.map(scriptData.extractor(MAPPINGS), input) };
}

module.exports = { MAPPINGS, extract };
