'use strict';

const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;
const assert = require('chai').assert;

describe('Search method', () => {
  it('should fetch a valid application list', () => {
    return gplay.search({ term: 'Panda vs Zombies' })
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

  // preregister tend to have some fields missing, increasing chances of failure
  // by searching "preregister" we have more chances of getting some in the results
  it('should search for pre register', () =>
    gplay.search({ term: 'preregister', num: 10 })
      .then((apps) => apps.map(assertValidApp)));

  it('should search for pre register with fullDetail', () =>
    gplay.search({ term: 'preregister', num: 10, fullDetail: true })
      .then((apps) => apps.map(assertValidApp))).timeout(5 * 1000);

  it('should fetch multiple pages of distinct results', () =>
    gplay.search({ term: 'panda', num: 55 })
      .then((apps) => {
        assert.equal(apps.length, 55, 'should return as many apps as requested');
      }));

  it('should fetch multiple pages of when not starting from cluster of subsections', () =>
    gplay.search({ term: 'panda', num: 65 })
      .then((apps) => {
        assert.equal(apps.length, 65, 'should return as many apps as requested');
      }));
});
