import { assert } from 'chai';
import gplay from '../index.js';
import * as R from 'ramda';

describe('Categories method', () => {
  it('should fetch valid list of categories', () => {
    return gplay.categories().then(categories => {
      assert.isArray(categories);
      // Regression guard for #671: the old page-scraping implementation
      // silently degraded to just ['APPLICATION'] when Google stopped
      // rendering the category menu server-side.
      assert.isAbove(categories.length, 1);
      assert.include(categories, 'APPLICATION');
      assert.include(categories, 'GAME');
    });
  });

  it('should have all categories from constant list of categories', () => {
    return gplay.categories().then(categories => {
      const categoriesConst = Object.keys(gplay.category);
      assert.deepEqual(
        R.difference(categories, categoriesConst),
        [],
        'Google Play has categories that are not in "category" constant'
      );
    });
  });
});
