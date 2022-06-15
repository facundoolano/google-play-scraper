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

const ROOT_MAPPINGS = {
  title: [0, 0, 0],
  appId: { path: [0, 41, 0, 2], func: extractPackageId },
  url: {
    path: [0, 41, 0, 2],
    fun: (path) => new url.URL(path, BASE_URL).toString()
  },
  icon: [0, 95, 0, 3, 2],
  developer: [0, 68, 0],
  developerId: {
    path: [0, 68, 1, 4, 2],
    fun: extractPackageId
  },
  priceText: {
    path: [0, 57, 0, 0, 0, 0, 1],
    fun: (price) => (price === undefined || price[0] === 0) ? 'FREE' : price[1] + ' ' + price[0]
  },
  currency: [0, 57, 0, 0, 0, 0, 1, 1],
  price: [0, 57, 0, 0, 0, 0, 1, 0],
  free: {
    path: [0, 57, 0, 0, 0, 0, 1, 0],
    fun: (price) => price === 0
  },
  summary: [0, 72, 0, 1],
  scoreText: [0, 51, 0],
  score: [0, 51, 1]
};

function extractPackageId (link) {
  return link.split('?id=')[1];
}

const isArray = (array) => Array.isArray(array) && typeof array !== 'string';

const isApp = (app) => {
  return R.path(MAPPINGS.appId, app) !== null &&
    R.path(MAPPINGS.developer, app) !== null;
};

const isRootApp = (app) => {
  return R.path(ROOT_MAPPINGS.appId, app) !== null && typeof R.path(ROOT_MAPPINGS.appId, app) === 'string' &&
    R.path(ROOT_MAPPINGS.developer, app) !== null;
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

  let apps = [];
  let rootApp = [];

  let token = '';

  for (let i = 0; i < arrayToCheck.length; i++) {
    const { path } = arrayToCheck[i];

    const app = R.path([...basePath, ...path], html);

    if (app && isApp([app])) {
      apps = R.path([...basePath, ...path.slice(0, path.length - 2)], html);
      token = R.path([...basePath, ...path.slice(0, path.length - 3), ...[1, 3, 1]], html);
      continue;
    }

    if (app && isRootApp([app])) {
      rootApp = [app];
    }
  }

  return { apps, rootApp, token };
}
/*
 * Apply MAPPINGS for each application in list from root path
*/

function extract (rootPath, resultsBasePath, data) {
  let input = R.path(rootPath, data);

  if (input === undefined) {
    // Check for more results
    const { apps, rootApp, token } = findMoreResultsMapping(data, resultsBasePath);

    if (apps === undefined) {
      return [];
    }

    const results = R.map(scriptData.extractor(MAPPINGS), apps);
    const rootResult = R.map(scriptData.extractor(ROOT_MAPPINGS), rootApp);

    return { results: [...rootResult, ...results], rootResult, token };
  }

  const token = R.path([...rootPath.slice(0, rootPath.length - 1), ...[1, 3, 1]], data);

  return { results: R.map(scriptData.extractor(MAPPINGS), input), token };
}

module.exports = { MAPPINGS, extract };
