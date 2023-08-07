import gplay from '../index.js';
import { assert } from 'chai';
import { assertValidApp, assertValidUrl } from './common.js';
import validator from 'validator';

describe('Developer method', () => {
  it('should fetch a valid application list for the given developer with string id', () => {
    return gplay.developer({ devId: 'Jam City, Inc.' })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.map((app) => assert.equal(app.developer, 'Jam City, Inc.')));
  });

  it('should fetch a valid application list for the given developer with numeric id', () => {
    return gplay.developer({ devId: '5700313618786177705' })
      .then((apps) => apps.map(assertValidApp))
      .then((apps) => apps.forEach((app) => {
        if (app.developerId) {
          assert.equal(app.developerId, '5700313618786177705');
        }
      }));
  });

  it('should not throw an error if too many apps requested', () => {
    return gplay.developer({ devId: '5700313618786177705', num: 500 })
      .then((apps) => {
        assert(apps.length >= 100, 'should return as many apps as availabe');
      });
  });

  it('should fetch a valid application list with full detail', () => {
    return gplay.developer({ devId: '5700313618786177705', num: 10, fullDetail: true })
      .then((apps) => {
        apps.forEach((app) => {
          assert.isNumber(app.minInstalls);
          // IF APP IS NOT RELEASED
          // THIS MEANS THAT IT SHOULDN'T HAVE REVIEWS
          if (app.released) {
            assert.isNumber(app.reviews);
          }

          assert.isString(app.description);
          assert.isString(app.descriptionHTML);
          assert.isNumber(app.updated);

          assert.hasAnyKeys(app, 'genre');
          assert.hasAnyKeys(app, 'genreId');

          assert.isString(app.version || '');
          assert.isString(app.size || '');
          assert.isString(app.androidVersionText);
          assert.isString(app.androidVersion);
          assert.isString(app.contentRating);

          assert.hasAnyKeys(app, 'priceText');
          assert.hasAnyKeys(app, 'free');

          assert.isString(app.developer);
          assert.isString(app.developerId);
          if (app.developerWebsite) {
            assertValidUrl(app.developerWebsite);
          }
          assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

          ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));
          app.screenshots.map(assertValidUrl);
          app.comments.map(assert.isString);
        });
      });
  }).timeout(15 * 1000);
});
