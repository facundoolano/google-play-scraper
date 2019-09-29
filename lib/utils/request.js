'use strict';

const requestLib = require('request');
const throttled = require('throttled-request')(requestLib);
const debug = require('debug')('google-play-scraper');

function doRequest (opts, limit) {
  let req = requestLib;
  if (limit) {
    throttled.configure({
      requests: limit,
      milliseconds: 1000
    });
    req = throttled;
  }

  return new Promise((resolve, reject) => req(opts, function (error, response, body) {
    if (error) {
      return reject(error);
    }
    if (response.statusCode >= 400) {
      const reason = new Error();
      reason.response = response;
      return reject(reason);
    }
    resolve(body);
  }));
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
