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

        assert(app.screenshots.length);
        app.screenshots.map(assertValidUrl);

        assert(app.comments.length);
        app.comments.map(assert.isString);

        assert(app.recentChanges.length);
        app.recentChanges.map(assert.isString);
      });
  });


  const languages = [
    ['de', 'de'],
    ['en', 'au'],
    ['en', 'in'],
    ['en', 'us'],
    ['en', 'gb'],
    ['ar'],
    ['bg'],
    ['zh', 'hk'],
    ['zh', 'cn'],
    ['zh', 'tw'],
    ['ko', 'kr'],
    ['hr'],
    ['da', 'dk'],
    ['es', '419'],
    ['es', 'es'],
    ['es', 'us'],
    ['et'],
    ['fr', 'ca'],
    ['fr', 'fr'],
    ['fi', 'fi'],
    ['el', 'gr'],
    ['iw', 'il'],
    ['hi', 'in'],
    ['hu', 'hu'],
    ['is', 'is'],
    ['it', 'it'],
    ['ja', 'jp'],
    ['lv'],
    ['lt'],
    ['nl', 'nl'],
    ['no', 'no'],
    ['pl', 'pl'],
    ['pt', 'br'],
    ['pt', 'pt'],
    ['ro'],
    ['ru', 'ru'],
    ['sr'],
    ['sk'],
    ['sl'],
    ['sv', 'se'],
    ['cs', 'cz'],
    ['th'],
    ['tr', 'tr'],
    ['uk'],
    ['vi']
  ];

  for (let i in languages) {
    let lang = languages[i][0];
    let country = typeof languages[i][1] !== 'undefined' ? languages[i][1] : lang;

    it('should fetch valid application data in '+lang+'_'+country, () => {
      return gplay.app({appId: 'com.facebook.katana', lang: lang, country: country})
        .then((app) => {
          assert.equal(app.appId, 'com.facebook.katana');
          assert.equal(app.title, 'Facebook');
          assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.facebook.katana&hl='+lang+'&gl='+country);
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
          assert.equal(app.genreId, 'SOCIAL');

          assert.isString(app.version);
          assert.isString(app.size);
          assert.isString(app.requiredAndroidVersion);
          assert.isString(app.contentRating);

          assert.equal(app.price, '0');
          assert(app.free);

          assert.equal(app.developer, 'Facebook');
          assertValidUrl(app.developerWebsite);
          assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

          if (app.video) {
            assertValidUrl(app.video);
          }

          ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));

          assert(app.screenshots.length);
          app.screenshots.map(assertValidUrl);

          assert(app.comments.length);
          app.comments.map(assert.isString);

          assert(app.recentChanges.length);
          app.recentChanges.map(assert.isString);
        });
    });
  }
});
