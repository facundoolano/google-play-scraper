'use strict';

const assert = require('chai').assert;
const gplay = require('../index');

describe('Categories method', () => {
  it('should fetch valid list of categories', () => {
    return gplay.categories().then(categoryIds => {
      assert.isArray(categoryIds);
      assert.isTrue(categoryIds.length > 0);
    });
  });

  it('should have all categories from constant list of categories', () => {
    return gplay.categories().then(categoryIds => {
      for (const category of categoryIds) {
        assert.equal(category, gplay.category[category]);
      }
    });
  });
});
