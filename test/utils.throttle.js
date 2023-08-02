import requestLib from 'got';
import throttled from '../lib/utils/throttle.js';
import sinon from 'sinon';
import { assert } from 'chai';

describe('Throttle tests', function () {
  let server;

  before(function () {
    server = sinon.fakeServer.create();
  });

  after(function () {
    server.restore();
  });

  const url = 'https://yesno.wtf/api';

  it('Should make three requests with 5000ms interval. (Throttle function)', function () {
    server.respondWith('GET', url, JSON.stringify({ test: 'this works' }));
    this.timeout(15000);
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
