'use strict';

const gplay = require('../index');
const assert = require('chai').assert;
const assertValidApp = require('./common').assertValidApp;

describe('Developer method', () => {
  it('should fetch a valid application list for the given developer', () => {
    return gplay.developer({devId: 'DxCo Games'})
    .then((apps) => apps.map(assertValidApp))
    .then((apps) => apps.map((app) => assert.equal(app.developer, 'DxCo Games')));
  });
});
