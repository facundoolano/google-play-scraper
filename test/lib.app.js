'use strict';

const assert = require('chai').assert;
const validator = require('validator');
const assertValidUrl = require('./common').assertValidUrl;
const gplay = require('../index');

describe('App method', () => {
  it('should fetch valid application data', () => {
    return gplay.app({appId: 'com.sgn.pandapop.gp'})
      .then((app) => {
        assert.equal(app.appId, 'com.sgn.pandapop.gp');
        assert.equal(app.title, 'Panda Pop! Free Bubble Shooter Saga Game');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=en&gl=us');
        assertValidUrl(app.icon);

        assert.isNumber(app.score);
        assert(app.score > 0);
        assert(app.score <= 5);

        assert.isNumber(app.minInstalls);
        assert.isNumber(app.reviews);

        assert.isString(app.summary);
        assert.isString(app.description);
        assert.isString(app.descriptionHTML);
        assert.isNumber(app.updated);
        assert.isString(app.released);
        assert.equal(app.genre, 'Puzzle');
        assert.equal(app.genreId, 'GAME_PUZZLE');
        assert.equal(app.familyGenre, undefined);
        assert.equal(app.familyGenreId, undefined);

        assert.isString(app.version);
        if (app.size) {
          assert.isString(app.size);
        }
        assert.isString(app.contentRating);

        assert.equal(app.androidVersion, '4.1');
        assert.equal(app.androidVersionText, '4.1 and up');

        assert.equal(app.priceText, 'Free');
        assert.equal(app.price, 0);
        assert(app.free === true);
        assert.equal(app.offersIAP, true);
        // assert(app.preregister === false);

        assert.equal(app.developer, 'Jam City, Inc.');
        assert.equal(app.developerId, '5509190841173705883');
        assert.equal(app.developerInternalID, '5509190841173705883');
        assertValidUrl(app.developerWebsite);
        assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

        assertValidUrl(app.video);
        ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));

        assert(app.screenshots.length);
        app.screenshots.map(assertValidUrl);

        assert(app.comments.length);
        app.comments.map(assert.isString);

        assert.isString(app.recentChanges);
      });
  });

  it('should properly parse a VARY android version', () => {
    return gplay.app({appId: 'com.facebook.katana'})
      .then((app) => {
        assert.equal(app.androidVersion, 'VARY');
        assert.equal(app.androidVersionText, 'Varies with device');
      });
  });

  it('should get the developer physical address', () => {
    return gplay.app({appId: 'com.snapchat.android'})
      .then((app) => {
        assert.equal(app.developerAddress, '63 Market St.\nVenice CA, 90291');
      });
  });

  it('should get the privacy policy', () => {
    return gplay.app({appId: 'com.snapchat.android'})
      .then((app) => {
        assert.equal(app.privacyPolicy, 'http://www.snapchat.com/privacy');
      });
  });

  it('should fetch app in spanish', () => {
    return gplay.app({appId: 'com.sgn.pandapop.gp', lang: 'es', country: 'ar'})
      .then((app) => {
        assert.equal(app.appId, 'com.sgn.pandapop.gp');
        assert.equal(app.title, 'Panda Pop');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=es&gl=ar');
        assert.isNumber(app.minInstalls);

        assert.equal(app.androidVersion, '4.1');
        assert.equal(app.androidVersionText, '4.1 y versiones posteriores');
      });
  });

  it('should fetch app in french', () =>
    gplay.app({appId: 'com.sgn.pandapop.gp', lang: 'fr', country: 'fr'})
      .then((app) => {
        assert.equal(app.appId, 'com.sgn.pandapop.gp');
        assert.equal(app.title, 'Panda Pop');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=fr&gl=fr');
        assert.isNumber(app.minInstalls);

        assert.equal(app.androidVersion, '4.1');
        assert.equal(app.androidVersionText, '4.1 ou version ultérieure');
      }));

  it('should reject the promise for an invalid appId', () =>
    gplay.app({appId: 'com.dxco.pandavszombiesasdadad'})
     .then(() => {
       throw Error('should not resolve');
     })
     .catch((err) => {
       assert.equal(err.message, 'App not found (404)');
     }));

  it('should reject the promise when appId is not passed', () =>
    gplay.app({Testkey: 'com.dxco.pandavszombiesasdadad'})
     .then(() => {
       throw Error('should not resolve');
     })
     .catch((err) => {
       assert.equal(err.message, 'appId missing');
     }));

  it('should fetch PriceText for paid apps properly', () => {
    return gplay.app({appId: 'com.teslacoilsw.launcher.prime', country: 'in'})
     .then((app) => {
       assert.equal(app.priceText, '₹ 99.00');
       assert.equal(app.currency, 'INR');
     });
  });

  it('should fetch valid internal developer_id, if it differs from developer_id', () => {
    return gplay.app({appId: 'air.com.bitrhymes.bingo'})
      .then((app) => {
        assert.equal(app.developerInternalID, '6289421402968163029');
      });
  });
});
