'use strict';

const requestLib = require('request-promise');
const debug = require('debug')('google-play-scraper');

function request (opts) {
  debug('Making request: %j', opts);
  return requestLib(opts)
    .then(function (response) {
      debug('Request finished');
      return response;
    })
    .catch(function (reason) {
      debug('Request error:', reason.message, reason.response && reason.response.statusCode);

      if (reason.response && reason.response.statusCode === 404) {
        throw Error('App not found (404)');
      }
      throw Error('Error requesting Google Play:' + reason.message);
    });
}

module.exports = request;
