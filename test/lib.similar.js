import { assert } from 'chai';
import gplay from '../index.js';
import { assertValidApp } from './common.js';

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps) => apps.map(assertValidApp));
  });

  it('should fetch apps from similar category', () => {
    return gplay.similar({ appId: 'com.spotify.music' })
      .then((apps) => {
        assert.isAbove(apps.length, 0);
        apps.map(assertValidApp);
      });
  });
});
