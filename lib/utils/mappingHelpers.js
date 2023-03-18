const cheerio = require('cheerio');
const R = require('ramda');

function descriptionText (description) {
  // preserve the line breaks when converting to text
  const html = cheerio.load('<div>' + description.replace(/<br>/g, '\r\n') + '</div>');
  return html('div').text();
}

function priceText (priceText) {
  return priceText || 'Free';
}

function normalizeAndroidVersion (androidVersionText) {
  if (!androidVersionText) return 'VARY';

  const number = androidVersionText.split(' ')[0];
  if (parseFloat(number)) {
    return number;
  }

  return 'VARY';
}

function buildHistogram (container) {
  if (!container) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  return {
    1: container[1][1],
    2: container[2][1],
    3: container[3][1],
    4: container[4][1],
    5: container[5][1]
  };
}

/**
 * Extract the comments from google play script array
 * @param {array} comments The comments array
 */
function extractComments (comments) {
  if (!comments) return [];
  return comments.map(R.path([4])).slice(0, 5);
}

function extractFeatures (featuresArray) {
  if (featuresArray === null) {
    return [];
  }

  const features = featuresArray[2] || [];

  return features.map(feature => ({
    title: feature[0],
    description: R.path([1, 0, 0, 1], feature)
  }));
}

function getCategoriesRecursively (searchArray, res) {
  if (!searchArray || !searchArray.hasOwnProperty(0)) return;

  if (typeof searchArray[0] === 'string' && typeof searchArray[2] !== 'undefined') {
    if (res.findIndex((v) => v.name === searchArray[0]) === -1) {
      res.push({
        name: searchArray[0],
        id: searchArray[2]
      });
    }
  } else {
    searchArray.forEach((sub) => {
      getCategoriesRecursively(sub, res);
    });
  }
}

function extractCategories (searchArray) {
  if (!searchArray) return [];

  const res = [];

  const genre = R.path([1, 2, 79, 0, 0, 0], searchArray);
  if (genre) {
    res.push({
      name: genre,
      id: R.path([1, 2, 79, 0, 0, 2], searchArray)
    });
  }
  const familyGenre = R.path([0, 12, 13, 1, 0], searchArray);
  if (familyGenre) {
    res.push({
      name: familyGenre,
      id: R.path([0, 12, 13, 1, 2], searchArray)
    });
  }

  getCategoriesRecursively(R.path([1, 2, 118], searchArray), res);

  return res;
}

module.exports = {
  descriptionText,
  priceText,
  normalizeAndroidVersion,
  buildHistogram,
  extractComments,
  extractFeatures,
  extractCategories
};
