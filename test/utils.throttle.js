import requestLib from 'got';
import throttled from '../lib/utils/throttle.js';
import sinon from 'sinon';
import { assert } from 'chai';

describe('Throttle tests', function () {
  this.timeout(6000);
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

  it('Should make three requests with 2000ms interval. (Throttle function)', function () {
    // If we don't want to rely on the availability of a particular api we can use mocks.
    // The fake server intercept http calls and return specified objects if it mach the same method/url.
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
        assert.isAtMost(firstAndSecondReq, 3000);
        assert.isAtLeast(secondAndThirdReq, 1000);
        assert.isAtMost(secondAndThirdReq, 3000);
      });
  });
});
