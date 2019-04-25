'use strict';

const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps) => apps.map(assertValidApp));
  });
});
