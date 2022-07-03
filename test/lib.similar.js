'use strict';

const assert = require('chai').assert;
const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps) => apps.map(assertValidApp));
  });

  it('should fetch games from different developers', () => {
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps) => assert.isTrue(apps.some(app => app.developer !== apps[0].developer)));
  });
});
