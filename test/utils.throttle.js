const requestLib = require('got');
const throttled = require('../lib/utils/throttle');
const sinon = require('sinon');
const assert = require('chai').assert;

describe('Throttle tests', function () {
  let server;
  this.timeout(15000);

  before(function () {
    server = sinon.fakeServer.create();
  });
  after(function () {
    server.restore();
  });

  const url = 'https://yesno.wtf/api';

  it('Should make three requests with 5000ms interval. (Throttle function)', function () {
    server.respondWith('GET', url, JSON.stringify({ test: 'this works' }));
    const req = throttled(requestLib, {
      limit: 1,
      interval: 5000
    });
    return Promise.all([req({ url }), req({ url }), req({ url })])
      .then((response) => response.map(req => new Date(req.headers.date).getTime()))
      .then((dates) => {
        const firstAndSecondReq = dates[1] - dates[0];
        const secondAndThirdReq = dates[2] - dates[1];

        assert.isAtLeast(firstAndSecondReq, 5000);
        assert.isAtMost(firstAndSecondReq, 6500);
        assert.isAtLeast(secondAndThirdReq, 5000);
        assert.isAtMost(secondAndThirdReq, 6500);
      });
  });
});