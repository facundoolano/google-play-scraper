const requestLib = require('got');
const throttled = require('../lib/utils/throttle');

it('Should make three requests with 5000ms interval. (Throttle function)', function (done) {
  this.timeout(15000);
  const req = throttled(requestLib, {
    limit: 1,
    interval: 5000
  });

  Promise.all([req({ url: 'https://httpbin.org/uuid' }), req({ url: 'https://httpbin.org/uuid' }), req({ url: 'https://httpbin.org/uuid' })])
    .then((response) => response.map(req => new Date(req.headers.date).getTime()))
    .then((dates) => {
      const firstAndSecondReq = dates[1] - dates[0];
      const secondAndThirdReq = dates[2] - dates[1];
      if (
        (firstAndSecondReq >= 5000 && firstAndSecondReq <= 6500) &&
              (secondAndThirdReq >= 5000 && secondAndThirdReq <= 6500)
      ) {
        done();
      } else {
        throw new Error('Wrong interval beetween requests.');
      }
    });
});
