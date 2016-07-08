'use strict';

const gplay = require('../index');
const assert = require('chai').assert;

describe('Permissions method', () => {
  it('should return an array of permissions and descriptions', () =>
    gplay.permissions({appId: 'com.dxco.pandavszombies'})
      .then((results) => {
        assert(results.length);
        results.map((perm) => {
          assert.isString(perm.permission);
          assert.isString(perm.description);
        });
      }));

  it('should return skip descriptions if short option is passed', () =>
    gplay.suggest({term: 'p'})
      .then((results) => {
        assert(results.length);
        results.map(assert.isString);
      }));
});
