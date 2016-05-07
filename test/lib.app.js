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

        assert.isString(app.description);
        assert.isString(app.descriptionHTML);
        assert.isString(app.updated);
        assert.equal(app.genre, 'Action');
        assert.equal(app.genreId, 'GAME_ACTION');

        assert.isString(app.version);
        assert.isString(app.size);
        assert.isString(app.requiredAndroidVersion);
        assert.isString(app.contentRating);

        assert.equal(app.price, '0');
        assert(app.free);

        assert.equal(app.developer, 'DxCo Games');
        assertValidUrl(app.developerWebsite);
        assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

        assertValidUrl(app.video);
        ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));
        app.screenshots.map(assertValidUrl);
        app.comments.map(assert.isString);
      });
  });

  it('should fetch app in a different language', () => {
    return gplay.app({appId: 'com.dxco.pandavszombies', lang: 'es', country: 'ar'})
      .then((app) => {
        assert.equal(app.appId, 'com.dxco.pandavszombies');
        assert.equal(app.title, 'Panda vs Zombies');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=es&gl=ar');
      });
  });
});
