'use strict';

const gplay = require('../index');
const assert = require('chai').assert;
const assertValidApp = require('./common').assertValidApp;
const R = require('ramda');

describe('Developer method', () => {
  it('should fetch a valid application list for the given developer', () => {
    return gplay.developer({devId: 'DxCo Games'})
    .then((apps) => apps.map(assertValidApp))
    .then((apps) => apps.map((app) => assert.equal(app.developer, 'DxCo Games')));
  });

  it('should fetch several pages of distinct apps for the developer', () =>
     gplay.developer({devId: 'Google LLC', num: 100})
     .then((apps) => {
       assert.equal(100, apps.length, 'should return as many apps as requested');
       assert.equal(100, R.uniq(apps).length, 'should return distinct apps');
     }));

  it('should not throw an error if too many apps requested', () =>
     gplay.developer({devId: 'Google LLC', num: 500})
     .then((apps) => {
       assert(apps.length >= 100, 'should return as many apps as availabe');
     }));
});
