'use strict';

const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;
const assert = require('chai').assert;
const R = require('ramda');

describe('Search method', () => {
  it('should fetch a valid application list', () => {
    return gplay.search({term: 'Panda vs Zombies'})
    .then((apps) => apps.map(assertValidApp));
  });

  it('should validate the results number', function () {
    const count = 5;
    return gplay.search({
      term: 'vr',
      num: count
    })
    .then((apps) => {
      apps.map(assertValidApp);
      assert(apps.length === count, `should return ${count} items but ${apps.length} returned`);
    });
  });

  it('should fetch multiple pages of distinct results', () =>
     gplay.search({term: 'panda', num: 155})
     .then((apps) => {
       assert(apps.length === 155, 'should return as many apps as requested');
       assert(R.uniq(apps).length === 155, 'should return distinct apps');
     }));

  it('should fetch multiple pages of when not starting from cluster of subsections', () =>
     gplay.search({term: 'clash of clans', num: 65})
     .then((apps) => {
       assert(apps.length === 65, 'should return as many apps as requested');
       assert(R.uniq(apps).length === 65, 'should return distinct apps');
     }));
});
