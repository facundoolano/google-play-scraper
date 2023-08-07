import { assert } from 'chai';
import gplay from '../index.js';
import { assertValidApp } from './common.js';

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps) => apps.map(assertValidApp));
  });

  it('should fetch games from different developers', () => {
    return gplay.similar({ appId: 'com.instagram.android' })
      .then((apps) => assert.isTrue(apps.some(app => app.developer !== apps[0].developer)));
  });
});
