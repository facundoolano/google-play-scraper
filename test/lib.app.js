'use strict';

const assert = require('chai').assert;
const validator = require('validator');
const assertValidUrl = require('./common').assertValidUrl;
const gplay = require('../index');

describe('App method', () => {
  it('should fetch valid application data', () => {
    return gplay.app({appId: 'com.dxco.pandavszombies'})
      .then((app) => {
        assert.equal(app.appId, 'com.dxco.pandavszombies');
        assert.equal(app.title, 'Panda vs Zombies');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=en&gl=us');
        assertValidUrl(app.icon);

        assert.isNumber(app.score);
        assert(app.score > 0);
        assert(app.score <= 5);

        assert.isNumber(app.minInstalls);
        assert.isNumber(app.maxInstalls);
        assert.isNumber(app.reviews);

        assert.isString(app.summary);
        assert.isString(app.description);
        assert.isString(app.descriptionHTML);
        assert.isString(app.updated);
        assert.equal(app.genre, 'Action');
        assert.equal(app.genreId, 'GAME_ACTION');

        assert.isString(app.version);
        if (app.size) {
          assert.isString(app.size);
        }
        assert.isString(app.contentRating);

        assert.equal(app.androidVersion, '2.3');
        assert.equal(app.androidVersionText, '2.3 and up');

        assert.equal(app.price, '0');
        assert(app.free === true);
        assert(app.preregister === false);

        assert.equal(app.developer, 'DxCo Games');
        assert.equal(app.developerId, 'DxCo+Games');
        assertValidUrl(app.developerWebsite);
        assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

        assertValidUrl(app.video);
        ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));

        assert(app.screenshots.length);
        app.screenshots.map(assertValidUrl);

        assert(app.comments.length);
        app.comments.map(assert.isString);

        assert(app.recentChanges.length);
        app.recentChanges.map(assert.isString);
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

  it('should fetch app in spanish', () => {
    return gplay.app({appId: 'com.dxco.pandavszombies', lang: 'es', country: 'ar'})
      .then((app) => {
        assert.equal(app.appId, 'com.dxco.pandavszombies');
        assert.equal(app.title, 'Panda vs Zombies');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=es&gl=ar');
        assert.isNumber(app.minInstalls);
        assert.isNumber(app.maxInstalls);

        assert.equal(app.androidVersion, '2.3');
        assert.equal(app.androidVersionText, '2.3 y versiones superiores');
      });
  });

  it('should fetch app in french', () =>
    gplay.app({appId: 'com.dxco.pandavszombies', lang: 'fr', country: 'fr'})
      .then((app) => {
        assert.equal(app.appId, 'com.dxco.pandavszombies');
        assert.equal(app.title, 'Panda vs Zombies');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=fr&gl=fr');
        assert.isNumber(app.minInstalls);
        assert.isNumber(app.maxInstalls);

        assert.equal(app.androidVersion, '2.3');
        assert.equal(app.androidVersionText, '2.3 ou version ultérieure');
      }));

  it('should reject the promise for an invalid appId', (done) =>
    gplay.app({appId: 'com.dxco.pandavszombiesasdadad'})
      .then(() => done('should not resolve'))
      .catch((err) => {
        assert.equal(err.message, 'App not found (404)');
        done();
      })
      .catch(done));
});
