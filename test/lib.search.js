import { assert } from 'chai';
import gplay from '../index.js';
import { assertValidApp, assertIdsInArray } from './common.js';

describe('Search method', () => {
  it('should fetch a valid application list', () => {
    return gplay
      .search({ term: 'Panda vs Zombies' })
      .then((apps) => apps.map(assertValidApp));
  });

  describe('additional properties', () => {
    it('should fetch a valid application list with developer property', () => {
      return gplay
        .search({
          term: 'com.google.android.gm'
        })
        .then((apps) => apps.map((app) => assert.isString(app.developer)));
    });

    it('should fetch a valid application list with developerId property', () => {
      return gplay
        .search({
          term: 'com.google.android.gm'
        })
        .then((apps) => apps.map((app) => assert.isString(app.developerId)));
    });
  });

  it('should validate the results number', function () {
    const count = 5;
    return gplay
      .search({
        term: 'vr',
        num: count
      })
      .then((apps) => {
        apps.map(assertValidApp);
        assert(
          apps.length === count,
          `should return ${count} items but ${apps.length} returned`
        );
      });
  });

  // preregister tend to have some fields missing, increasing chances of failure
  // by searching "preregister" we have more chances of getting some in the results
  it('should search for pre register', () =>
    gplay
      .search({ term: 'preregister', num: 10 })
      .then((apps) => apps.map(assertValidApp)));

  it('should search for pre register with fullDetail', () =>
    gplay
      .search({ term: 'preregister', num: 10, fullDetail: true })
      .then((apps) => apps.map(assertValidApp))).timeout(5 * 1000);

  it('should fetch multiple pages of distinct results', () =>
    gplay.search({ term: 'p', num: 55 }).then((apps) => {
      assert.equal(apps.length, 55, 'should return as many apps as requested');
    }));

  it('should fetch multiple pages of when not starting from cluster of subsections', () =>
    gplay.search({ term: 'p', num: 65 }).then((apps) => {
      assert.equal(apps.length, 65, 'should return as many apps as requested');
    }));

  describe('country and language specific', () => {
    describe('without more results section', () => {
      it('should fetch a valid application list for eu country', () => {
        return gplay
          .search({ term: 'Panda vs Zombies', country: 'GH' })
          .then((apps) => apps.map(assertValidApp));
      });

      it('should fetch a valid application list for non eu country', () => {
        return gplay
          .search({ term: 'Facebook', country: 'GE' })
          .then((apps) => apps.map(assertValidApp));
      });

      it('should fetch a valid application list for eu country with specific language', () => {
        return gplay
          .search({ term: 'Panda vs Zombies', country: 'BE', lang: 'it' })
          .then((apps) => apps.map(assertValidApp));
      });
    });
  });

  describe('more results mapping', () => {
    it('should return few netflix apps', () => {
      return gplay.search({ term: 'netflix' }).then((apps) => {
        assert.equal(apps[0].appId, 'com.netflix.mediaclient');
        assert.isAbove(apps.length, 0);
      });
    });

    it('should return few netflix apps from german store with german language', () => {
      return gplay
        .search({ term: 'netflix', lang: 'de', country: 'DE' })
        .then((apps) => {
          assert.equal(apps[0].appId, 'com.netflix.mediaclient');
          // Don't check specific ids, as results may vary
          assert.isAbove(apps.length, 1);
        });
    });

    it('should return few google mail apps', () => {
      return gplay.search({ term: 'gmail' }).then((apps) => {
        assert.equal(apps[0].appId, 'com.google.android.gm');
        assert.isTrue(
          apps.some((app) => app.appId === 'com.google.android.gm.lite')
        );
      });
    });

    it('should return apps for search with a category as query', () => {
      return gplay
        .search({ term: 'games' })
        .then((apps) => assertIdsInArray(apps, 'com.kiloo.subwaysurf'));
    });

    it('should return empty set when no results found', () => {
      return gplay
        .search({ term: 'asdasdyxcnmjysalsaflaslf' })
        .then(assert.isEmpty);
    });

    it('should return empty set when no results found in eu country store', () => {
      return gplay
        .search({ term: 'ASyyDASDyyASDASD', country: 'DE', lang: 'SP' })
        .then(assert.isEmpty);
    });

    it('should return empty set when no results found in us store with other language', () => {
      return gplay
        .search({ term: 'ASyyDASDyyASDASD', country: 'US', lang: 'FR' })
        .then(assert.isEmpty);
    });
  });

  describe('suggested search', () => {
    it('should return apps from suggested search', () => {
      return gplay.search({ term: 'runing app' }).then((apps) => {
        apps.map(assertValidApp);
        assertIdsInArray(
          apps,
          'com.runtastic.android',
          'running.tracker.gps.map',
          'com.google.android.apps.fitness'
        );
      });
    });

    it('should return apps from suggested search in european country', () => {
      return gplay
        .search({ term: 'runing tracker', country: 'GR' })
        .then((apps) => {
          apps.map(assertValidApp);
          assertIdsInArray(
            apps,
            'com.runtastic.android',
            'running.tracker.gps.map'
          );
        });
    });
  });
});
