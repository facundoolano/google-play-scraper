import { assert } from 'chai';
import { assertValidApp, assertValidUrl } from './common.js';
import validator from 'validator';
import gplay from '../index.js';

describe('List method', () => {
  const timeout = 20 * 1000;

  it('should throw and error if the given collection does not exist', () => {
    const collection = gplay.collection.TRENDING;

    return gplay.list({
      collection,
      num: 100
    })
      .catch((error) => {
        assert.equal(error.message, `The collection ${collection} is invalid for the given category, top apps or new apps`);
      });
  });

  it('should throw and error if the given collection exists but have no clusters', () => {
    const collection = gplay.collection.NEW_FREE;

    return gplay.list({
      collection,
      category: gplay.category.BUSINESS,
      num: 100
    })
      .catch((error) => {
        assert.equal(error.message, `The collection ${collection} is invalid for the given category, top apps or new apps`);
      });
  });

  it('should fetch a valid application list for the top free collection', () => {
    return gplay.list({
      collection: gplay.collection.TOP_FREE,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application list for the top paid collection', () => {
    return gplay.list({
      collection: gplay.collection.TOP_PAID,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert.isFalse(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application list for the new free collection', () => {
    return gplay.list({
      collection: gplay.collection.NEW_FREE,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application list for the new games free collection', () => {
    return gplay.list({
      collection: gplay.collection.NEW_FREE_GAMES,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application on a given collection regardless of the language', () => {
    return gplay.list({
      collection: gplay.collection.TOP_FREE,
      country: 'ru',
      lang: 'ru',
      num: 5
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application list for the given category and collection', () => {
    return gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_FREE
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should fetch a valid application list for the new free collection and GAME category', () => {
    return gplay.list({
      collection: gplay.collection.NEW_FREE,
      category: gplay.category.GAME,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should return error for application list for the new paid collection and FAMILY category', () => {
    const collection = gplay.collection.NEW_PAID;

    return gplay.list({
      collection,
      category: gplay.category.FAMILY,
      num: 100
    })
      .catch((error) => assert.equal(error.message, `The collection ${collection} is invalid for the given category, top apps or new apps`));
  }).timeout(timeout);

  it('should fetch apps for application list for the new free collection and FAMILY category', () => {
    return gplay.list({
      collection: gplay.category.NEW_FREE,
      category: gplay.category.FAMILY,
      num: 100
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert(app.free)));
  }).timeout(timeout);

  it('should validate the category', () => {
    return gplay.list({
      category: 'wrong',
      collection: gplay.collection.TOP_FREE
    })
      .then(assert.fail)
      .catch((e) => assert.equal(e.message, 'Invalid category wrong'));
  });

  it('should validate the collection', () => {
    return gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: 'wrong'
    })
      .then(assert.fail)
      .catch((e) => assert.equal(e.message, 'Invalid collection wrong'));
  });

  it('should validate the age range', () => {
    return gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_FREE,
      age: 'elderly'
    })
      .then(assert.fail)
      .catch((e) => assert.equal(e.message, 'Invalid age range elderly'));
  });

  it('should fetch apps with fullDetail', () => {
    return gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_FREE,
      fullDetail: true,
      num: 5
    })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.forEach((app) => {
        assert.isNumber(app.minInstalls);
        assert.isNumber(app.reviews);

        assert.isString(app.description);
        assert.isString(app.descriptionHTML);
        assert.isString(app.released);

        assert.equal(app.genre, 'Action');
        assert.equal(app.genreId, 'GAME_ACTION');

        assert.isString(app.version || '');
        assert.isString(app.size || '');
        assert.isString(app.androidVersionText);
        assert.isString(app.androidVersion);
        assert.isString(app.contentRating);

        assert.equal(app.priceText, 'Free');
        assert(app.free);

        assert.isString(app.developer);
        assert.isString(app.developerId);
        if (app.developerWebsite) {
          assertValidUrl(app.developerWebsite);
        }
        assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

        ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));
        app.screenshots.map(assertValidUrl);
        app.comments.map(assert.isString);
      }));
  }).timeout(timeout);

  // fetch last page of new paid apps, which have a bigger chance of including
  // results with no downloads (less fields, prone to failures)
  it('It should not fail with apps with no downloads', () =>
    gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_PAID,
      num: 20
    })
      .then((apps) => apps.map(assertValidApp)));

  it('It should not fail with apps with no downloads and fullDetail', () =>
    gplay.list({
      category: gplay.category.GAME_ACTION,
      collection: gplay.collection.TOP_FREE,
      num: 10,
      fullDetail: true
    })
      .then((apps) => apps.map(assertValidApp))
  ).timeout(timeout);

  it('should be able to retreive a list for each category', () => {
    const categoryIds = Object.keys(gplay.category);

    const fetchCategory = (category) => gplay.list({
      category,
      collection: gplay.collection.TOP_FREE,
      num: 10
    }).catch(() => {
      if (category !== gplay.category.WATCH_FACE) {
        assert.equal(category, 0, 'invalid category');
      }
    });

    return Promise.all(categoryIds.map(fetchCategory));
  }).timeout(200 * 1000);
});
