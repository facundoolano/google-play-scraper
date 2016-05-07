'use strict';

const gplay = require('../index');
const assertValidApp = require('./common').assertValidApp;

describe('Search method', () => {
  it('should fetch a valid application list', () => {
    return gplay.search({term: 'Panda vs Zombies'})
    .then((apps) => apps.map(assertValidApp));
  });
});
