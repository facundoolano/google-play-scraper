'use strict';

const debug = require('debug')('google-play-scraper');
const requestLib = require('got');
const throttled = require('./throttle.js');

function doRequest (opts, limit) {
  let req;
  if (limit) {
    req = throttled(
      requestLib, {
        interval: 1000,
        limit: limit
      }
    );
  } else {
    req = requestLib;
  }

  return new Promise((resolve, reject) => {
    req(opts)
      .then((response) => resolve(response.body))
      .catch((error) => reject(error));
  });
}

function request (opts, limit) {
  debug('Making request: %j', opts);
  return doRequest(opts, limit)
    .then(function (response) {
      debug('Request finished');
      return response;
    })
    .catch(function (reason) {
      debug('Request error:', reason.message, reason.response && reason.response.statusCode);

      let message = 'Error requesting Google Play:' + reason.message;
      if (reason.response && reason.response.statusCode === 404) {
        message = 'App not found (404)';
      }
      const err = Error(message);
      err.status = reason.response && reason.response.statusCode;
      throw err;
    });
}

module.exports = request;
