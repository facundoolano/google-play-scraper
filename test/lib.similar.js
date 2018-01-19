'use strict';

const gplay = require('../index');
const {assertValidApp, assertCyrillic} = require('./common');

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({appId: 'com.dxco.pandavszombies'})
      .then((apps) => apps.map(assertValidApp));
  });

  it('should respect passed language param', () => {
    return gplay.similar({appId: 'com.dxco.pandavszombies', lang: 'ru'})
      .then((apps) => apps.map(assertValidApp))
      .then(assertCyrillic);
  });
});
