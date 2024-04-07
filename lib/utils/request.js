import requestLib from 'got';
import throttled from './throttle.js';
import { CookieJar } from 'tough-cookie';
import createDebug from 'debug';

const cookieJar = new CookieJar();
const debug = createDebug('google-play-scraper');

function doRequest (opts, limit) {
  let req;

  // cookies are necessary for pagination to work consistently across requests
  opts.cookieJar = cookieJar;

  if (limit) {
    req = throttled(
      requestLib, {
        interval: 1000,
        limit
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

async function request (opts, limit) {
  debug('Making request: %j', opts);
  try {
    const response = await doRequest(opts, limit);
    debug('Request finished');
    return response;
  } catch (reason) {
    debug('Request error:', reason.message, reason.response && reason.response.statusCode);

    let message = 'Error requesting Google Play:' + reason.message;
    if (reason.response && reason.response.statusCode === 404) {
      message = 'App not found (404)';
    }
    const err = Error(message);
    err.status = reason.response && reason.response.statusCode;
    throw err;
  }
}

export default request;
