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

describe('Reviews method', () => {
  it('should retrieve the reviews of an app', () => {
    return gplay.reviews({appId: 'com.dxco.pandavszombies'})
    .then((reviews) => {
      reviews.map(assertValid);
    });
  });

  it('should validate the sort', () => {
    return gplay.reviews({
      appId: 'com.dxco.pandavszombies',
      sort: 'invalid'
    })
    .then(assert.fail)
    .catch((e) => assert.equal(e.message, 'Invalid sort invalid'));
  });
});
