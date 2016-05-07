'use strict';

const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;

describe('Similar method', () => {
  it('should fetch a valid application list', () => {
    return gplay.similar({appId: 'com.dxco.pandavszombies'})
    .then((apps) => apps.map(assertValidApp));
  });
});
