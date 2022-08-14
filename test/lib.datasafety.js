'use strict';

const gplay = require('../index');
const assert = require('chai').assert;
const assertValidUrl = require('./common').assertValidUrl;

function assertValidDataSafetyObject () {
  return (entry) => {
    assert.isString(entry.data);
    assert.isString(entry.purpose);
    assert.isString(entry.type);
    assert.isBoolean(entry.optional);
  };
}

describe('Data Safety method', () => {
  it('should return arrays of data shared, data collected, security practices and a privacy url', () =>
    gplay.datasafety({ appId: 'com.sgn.pandapop.gp' })
      .then((dataSafety) => {
        assert.isArray(dataSafety.sharedData);
        assert.isArray(dataSafety.collectedData);
        assert.isArray(dataSafety.securityPractices);
        assertValidUrl(dataSafety.privacyPolicyUrl);
      }));

  it('should return a valid shared and collected data object', () =>
    gplay.datasafety({ appId: 'com.sgn.pandapop.gp' })
      .then((dataSafety) => {
        dataSafety.sharedData.map(assertValidDataSafetyObject());
        dataSafety.collectedData.map(assertValidDataSafetyObject());
      }));

  it('should return a valid security practices object', () =>
    gplay.datasafety({ appId: 'com.sgn.pandapop.gp' })
      .then((dataSafety) => {
        dataSafety.securityPractices.map((practice) => {
          assert.isString(practice.practice);
          assert.isString(practice.description);
        });
      }));

  it('should return empty return for non existing app', () =>
    gplay.datasafety({ appId: 'app.foo.bar' })
      .then((dataSafety) => {
        assert.isEmpty(dataSafety.sharedData);
        assert.isEmpty(dataSafety.collectedData);
        assert.isEmpty(dataSafety.securityPractices);
        assert.isUndefined(dataSafety.privacyPolicyUrl);
      })
  );
});
