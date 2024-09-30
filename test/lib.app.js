import { assert } from 'chai';
import validator from 'validator';
import { assertValidUrl } from './common.js';
import gplay from '../index.js';

const validateAppDetails = (app) => {
  assert.equal(app.appId, 'com.sgn.pandapop.gp');
  assertValidUrl(app.icon);

  assert.isBoolean(app.isAvailableInPlayPass);

  assert.isNumber(app.score);
  assert(app.score > 0);
  assert(app.score <= 5);

  assert.isNumber(app.minInstalls);
  assert.isNumber(app.reviews);

  assert.isString(app.summary);
  assert.isString(app.description);
  assert.isString(app.descriptionHTML);
  assert.isString(app.released);
  assert.equal(app.genreId, 'GAME_PUZZLE');

  assert.isArray(app.categories);
  assert.isAbove(app.categories.length, 1);
  assert.equal(app.categories[0].id, 'GAME_PUZZLE');
  assert.notEqual(app.categories[1].id, 'GAME_PUZZLE');
  assert.hasAllKeys(app.categories[0], ['name', 'id']);

  assert.isString(app.version);
  if (app.size) {
    assert.isString(app.size);
  }
  assert.isString(app.contentRating);

  assert.equal(app.androidVersion, '7.0');
  assert.equal(app.androidMaxVersion, 'VARY');

  assert.isBoolean(app.available);
  assert.equal(app.priceText, 'Free');
  assert.equal(app.price, 0);
  assert.isTrue(app.free);
  assert.isTrue(app.offersIAP);
  assert.isString(app.IAPRange);
  assert.isFalse(app.preregister);
  assert.isFalse(app.earlyAccessEnabled);
  assert.isUndefined(app.originalPrice);
  assert.isUndefined(app.discountEndDate);

  assert.equal(app.developer, 'Jam City, Inc.');
  assert.equal(app.developerId, '5509190841173705883');
  assert.equal(app.developerInternalID, '5509190841173705883');
  assertValidUrl(app.developerWebsite);
  assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

  assertValidUrl(app.video);
  assertValidUrl(app.previewVideo);
  ['1', '2', '3', '4', '5'].map((v) => assert.property(app.histogram, v));

  assert(app.screenshots.length);
  app.screenshots.map(assertValidUrl);

  assert.isArray(app.comments);
  assert.isAbove(app.comments.length, 0);
  app.comments.map(assert.isString);

  assert.isString(app.recentChanges);
};

describe('App method', () => {
  it('should fetch valid application data', () => {
    return gplay.app({ appId: 'com.sgn.pandapop.gp' })
      .then((app) => {
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=en&gl=us');
        assert.equal(app.genre, 'Puzzle');
        assert.equal(app.androidVersionText, '7.0');
        validateAppDetails(app);
      });
  });

  it('should fetch valid application data for country: es', () => {
    return gplay.app({
      appId: 'com.sgn.pandapop.gp',
      country: 'es',
      lang: 'es'
    })
      .then((app) => {
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=es&gl=es');
        assert.equal(app.genre, 'Puzles');
        assert.equal(app.androidVersionText, '7.0');
        assert.equal(app.available, true);
        validateAppDetails(app);
      });
  });

  it('should fetch valid application data for country: br', () => {
    return gplay.app({
      appId: 'com.sgn.pandapop.gp',
      country: 'br',
      lang: 'pt'
    })
      .then((app) => {
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=pt&gl=br');
        assert.equal(app.genre, 'Quebra-cabeças');
        assert.equal(app.androidVersionText, '7.0');
        assert.equal(app.available, true);
        validateAppDetails(app);
      });
  });

  it('should check the developer legal information from the "About the developer" section', () => {
    return gplay.app({ appId: 'com.soundcloud.android' })
      .then((app) => {
        assert.equal(app.developerLegalName, 'SoundCloud Global Limited & Co. KG');
        assert.equal(app.developerLegalEmail, 'playstore@soundcloud.com');
        assert.equal(app.developerLegalAddress, 'Rheinsberger Str. 76 /, 10115 Berlin, Germany');
        assert.equal(app.developerLegalPhoneNumber, '+49 1573 5982119');
      });
  });

  it('should properly parse a VARY android version', () => {
    return gplay.app({ appId: 'com.facebook.katana' })
      .then((app) => {
        assert.equal(app.androidVersion, 'VARY');
        assert.equal(app.androidVersionText, 'Varies with device');
      });
  });

  it('should get the developer physical address', () => {
    return gplay.app({ appId: 'com.snapchat.android' })
      .then((app) => {
        assert.equal(app.developerAddress, '2772 Donald Douglas Loop, North\n' +
          'Santa Monica, CA 90405\n' +
          'USA');
      });
  });

  it('should get the privacy policy', () => {
    return gplay.app({ appId: 'com.snapchat.android' })
      .then((app) => {
        assert.equal(app.privacyPolicy, 'http://www.snapchat.com/privacy');
      });
  });

  it('should fetch app in spanish', () => {
    return gplay.app({ appId: 'com.sgn.pandapop.gp', lang: 'es', country: 'ar' })
      .then((app) => {
        assert.equal(app.appId, 'com.sgn.pandapop.gp');
        assert.equal(app.title, 'Bubble Shooter: Panda Pop!');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=es&gl=ar');
        assert.isNumber(app.minInstalls);

        assert.equal(app.androidVersion, '7.0');
        assert.equal(app.androidVersionText, '7.0');
      });
  });

  it('should fetch app in french', () =>
    gplay.app({ appId: 'com.sgn.pandapop.gp', lang: 'fr', country: 'fr' })
      .then((app) => {
        assert.equal(app.appId, 'com.sgn.pandapop.gp');
        assert.equal(app.title, 'Panda Pop! Jeu de tir à bulles');
        assert.equal(app.url, 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp&hl=fr&gl=fr');
        assert.isNumber(app.minInstalls);

        assert.equal(app.androidVersion, '7.0');
        assert.equal(app.androidVersionText, '7.0');
      }));

  it('should reject the promise for an invalid appId', () =>
    gplay.app({ appId: 'com.dxco.pandavszombiesasdadad' })
      .then(() => {
        throw Error('should not resolve');
      })
      .catch((err) => {
        assert.equal(err.message, 'App not found (404)');
      }));

  it('should reject the promise when appId is not passed', () =>
    gplay.app({ Testkey: 'com.dxco.pandavszombiesasdadad' })
      .then(() => {
        throw Error('should not resolve');
      })
      .catch((err) => {
        assert.equal(err.message, 'appId missing');
      }));

  it('should fetch PriceText for paid apps properly', () => {
    return gplay.app({ appId: 'com.teslacoilsw.launcher.prime', country: 'in' })
      .then((app) => {
        assert.equal(app.priceText, `₹${app.price.toFixed(2)}`);
        assert.equal(app.currency, 'INR');
      });
  });

  it('should fetch valid internal developer_id, if it differs from developer_id', () => {
    return gplay.app({ appId: 'air.com.bitrhymes.bingo' })
      .then((app) => {
        assert.equal(app.developerInternalID, '9028773071151690823');
      });
  });

  it('should fetch available false for an app is unavailable in country', () => {
    return gplay.app({ appId: 'com.jlr.landrover.incontrolremote.appstore', country: 'tr' })
      .then((app) => {
        assert.equal(app.available, false);
      });
  });

  it('should fetch android version limit set for some old apps', () => {
    return gplay.app({ appId: 'air.com.zinkia.playset' })
      .then((app) => {
        assert.equal(app.androidVersion, '4.2');
        assert.equal(app.androidMaxVersion, '7.1.1');
      });
  });
});
