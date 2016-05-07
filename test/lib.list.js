'use strict';

const assert = require('chai').assert;
const assertValidApp = require('./common').assertValidApp;
const gplay = require('../index');

describe('List method', () => {
  it('should fetch a valid application list for the given category and collection', () => {
    return gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_FREE
    })
    .then((apps) => apps.map(assertValidApp))
    .then((apps) => apps.map((app) => assert(app.free)));
  });
});
