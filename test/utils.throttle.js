const requestLib = require('got');
const throttled = require('../lib/utils/throttle');
const sinon = require('sinon');
const assert = require('chai').assert;

describe('Throttle tests', function () {
  let server;

  // Create a fake http server to emulate http call and responses.
  before(function () {
    server = sinon.fakeServer.create();
  });

  // Remove any server responses added in current test suite.
  after(function () {
    server.restore();
  });

  const url = 'https://yesno.wtf/api'; // Fake url used in this test, it could be anything.

  it('Should make three requests with 1000ms interval. (Throttle function)', function () {

    // If there is any http request with specified url, the http call will be handled by the fake server and return specified object
    // This way we remove the dependance with any http api.
    server.respondWith('GET', url, JSON.stringify({ test: 'this works' }));
    const req = throttled(requestLib, {
      limit: 1,
      interval: 2000
    });
    return Promise.all([req({ url }), req({ url }), req({ url })])
      .then((response) => response.map(req => new Date(req.headers.date).getTime()))
      .then((dates) => {
        const firstAndSecondReq = dates[1] - dates[0];
        const secondAndThirdReq = dates[2] - dates[1];

        assert.isAtLeast(firstAndSecondReq, 1000);
        assert.isAtMost(firstAndSecondReq, 2000);
        assert.isAtLeast(secondAndThirdReq, 1000);
        assert.isAtMost(secondAndThirdReq, 2000);
      });
  });
});
