'use strict';

const gplay = require('../index');
const assert = require('chai').assert;

describe('Suggest method', () => {
  it('should return five suggestion for a common term', () => gplay.suggest({term: 'p'})
    .then((results) => {
      assert.equal(results.length, 5, `expected ${results} to have 5 elements`);
      results.map((r) => assert.include(r, 'p'));
    }));
});
