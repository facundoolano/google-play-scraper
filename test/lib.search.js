'use strict';

const gplay = require('../index');
const { assertValidApp, assertIdsInArray } = require('./common');
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
    gplay.search({ term: 'p', num: 55 })
      .then((apps) => {
        assert.equal(apps.length, 55, 'should return as many apps as requested');
      }));

  it('should fetch multiple pages of when not starting from cluster of subsections', () =>
    gplay.search({ term: 'p', num: 65 })
      .then((apps) => {
        assert.equal(apps.length, 65, 'should return as many apps as requested');
      }));

  describe('country and language specific', () => {
    describe('without more results section', () => {
      it('should fetch a valid application list for eu country', () => {
        return gplay.search({ term: 'Panda vs Zombies', country: 'GH' })
          .then((apps) => apps.map(assertValidApp));
      });

      it('should fetch a valid application list for non eu country', () => {
        return gplay.search({ term: 'Facebook', country: 'GE' })
          .then((apps) => apps.map(assertValidApp));
      });

      it('should fetch a valid application list for eu country with specific language', () => {
        return gplay.search({ term: 'Panda vs Zombies', country: 'BE', lang: 'it' })
          .then((apps) => apps.map(assertValidApp));
      });
    });
  });

  describe('more results mapping', () => {
    it('schould return few netflix apps', () => {
      return gplay.search({ term: 'netflix' })
        .then((apps) => {
          assert.equal(apps[0].appId, 'com.netflix.mediaclient');
          assertIdsInArray(apps, 'com.netflix.ninja', 'com.netflix.NGP.StrangerThings');
        });
    });

    it('should return few netflix apps from german store with german language', () => {
      return gplay.search({ term: 'netflix', lang: 'de', country: 'DE' })
        .then((apps) => {
          assert.equal(apps[0].appId, 'com.netflix.mediaclient');
          assertIdsInArray(apps, 'com.netflix.ninja', 'com.netflix.NGP.StrangerThings');
        });
    });

    it('should reutrn few google mail apps', () => {
      return gplay.search({ term: 'gmail' })
        .then((apps) => {
          assert.equal(apps[0].appId, 'com.google.android.gm');
          assertIdsInArray(apps, 'com.google.android.gm.lite', 'com.google.android.apps.docs');
        });
    });

    it('should return apps for search with a category as query', () => {
      return gplay.search({ term: 'games' })
        .then((apps) => assertIdsInArray(apps, 'com.kiloo.subwaysurf'));
    });

    it('should return empty set when no results found', () => {
      return gplay.search({ term: 'asdasdyxcnmjysalsaflaslf' })
        .then(assert.isEmpty);
    });

    it('should return empty set when no results found in eu country store', () => {
      return gplay.search({ term: 'ASyyDASDyyASDASD', country: 'DE', lang: 'SP' })
        .then(assert.isEmpty);
    });

    it('should return empty set when no results found in us store with other language', () => {
      return gplay.search({ term: 'ASyyDASDyyASDASD', country: 'US', lang: 'FR' })
        .then(assert.isEmpty);
    });
  });

  describe('suggested search', () => {
    it('should return apps from suggested search', () => {
      return gplay.search({ term: 'runing app' })
        .then((apps) => {
          apps.map(assertValidApp);
          assertIdsInArray(apps, 'com.runtastic.android', 'running.tracker.gps.map', 'com.google.android.apps.fitness');
        });
    });

    it('should return apps from suggested search in european country', () => {
      return gplay.search({ term: 'runing tracker', country: 'GR' })
        .then((apps) => {
          apps.map(assertValidApp);
          assertIdsInArray(apps, 'com.runtastic.android', 'running.tracker.gps.map', 'com.google.android.apps.fitness');
        });
    });
  });
});
