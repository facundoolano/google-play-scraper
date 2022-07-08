'use strict';

const request = require('./utils/request');
const { BASE_URL } = require('./constants');

function suggest (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts && !opts.term) {
      throw Error('term missing');
    }

    const lang = opts.lang || 'en';
    const country = opts.country || 'us';
    // FIXME duplicated from permissions
    const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=IJ4APc&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${lang}&gl=${country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

    const term = encodeURIComponent(opts.term);
    const body = `f.req=%5B%5B%5B%22IJ4APc%22%2C%22%5B%5Bnull%2C%5B%5C%22${term}%5C%22%5D%2C%5B10%5D%2C%5B2%5D%2C4%5D%5D%22%5D%5D%5D`;
    const options = Object.assign({
      url,
      body,
      method: 'POST',
      followAllRedirects: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then((html) => {
        const input = JSON.parse(html.substring(5));
        const data = JSON.parse(input[0][2]);

        if (data === null) {
          return [];
        }
        return data[0][0].map(s => s[0]);
      })
      .then(resolve)
      .catch(reject);
  });
}

module.exports = suggest;
