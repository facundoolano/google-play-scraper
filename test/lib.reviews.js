'use strict';

const gplay = require('../index');
const assert = require('chai').assert;

function assertValid (review) {
  assert.isString(review.userId);
  assert.isString(review.userName);
  assert.isString(review.date);
  assert.isString(review.title);
  assert.isString(review.text);
  assert.isNumber(review.score);
  assert(review.score > 0);
  assert(review.score <= 5);
}

describe('Suggest method', () => {
  it('should return five suggestion for a common term', () => {
    return gplay.reviews({appId: 'com.dxco.pandavszombies'})
    .then((reviews) => {
      reviews.map(assertValid);
    });
  });
});
