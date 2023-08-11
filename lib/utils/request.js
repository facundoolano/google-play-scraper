import requestLib from 'got';
import pThrottle from 'p-throttle';
import createDebug from 'debug';

const debug = createDebug('google-play-scraper');

function doRequest (opts, throttleParams) {

  const req = (resolve, reject) => requestLib(opts)
    .then((response) => resolve(response.body))
    .catch((error) => reject(error));

  let promiseToResolve = (resolve, reject) => req(resolve, reject);

  if (throttleParams !== undefined) {
    const throttle = pThrottle({
      limit: throttleParams.limit ? throttleParams.limit : 1,
      interval: throttleParams.interval ? throttleParams.interval : 1000
    });
    promiseToResolve = (resolve, reject) => throttle(req(resolve, reject));
  }
  return new Promise(promiseToResolve);
}

async function request (opts, throttleParams) {
  debug('Making request: %j', opts);
  try {
    const response = await doRequest(opts, throttleParams);
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
