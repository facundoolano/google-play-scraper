import { assert } from 'chai';
import gplay from '../index.js';
import { parseSimilarApps } from '../lib/similar.js';
import { assertValidApp } from './common.js';

describe('Similar method', () => {
  it('should throw the domain error, not a TypeError, when the page has no similar cluster', () => {
    // Simulates an app page whose parsed script data carries no ag2B9c
    // service request section: extraction yields undefined, which used to
    // crash with "Cannot read properties of null (reading 'length')" (#701).
    const parsedWithoutClusters = { serviceRequestData: {} };
    assert.throws(
      () => parseSimilarApps(parsedWithoutClusters, { country: 'us', lang: 'en' }),
      /Similar apps not found/
    );
  });

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
