import createDebug from 'debug';
import * as R from 'ramda';

const debug = createDebug('google-play-scraper:scriptData');

/**
* This method looks for the mapping inside the serviceRequestData object
* The serviceRequestData object is mapped from the AF_dataServiceRequests html var
*
* @param {object} parsedData The response mapped object
* @param {object} spec The mappings spec
*/
function extractDataWithServiceRequestId (parsedData, spec) {
  const serviceRequestMapping = Object.keys(parsedData.serviceRequestData);
  const filteredDsRootPath = serviceRequestMapping.filter(serviceRequest => {
    const dsValues = parsedData.serviceRequestData[serviceRequest];

    return dsValues.id === spec.useServiceRequestId;
  });

  const formattedPath = (filteredDsRootPath.length)
    ? [filteredDsRootPath[0], ...spec.path]
    : spec.path;

  return R.path(formattedPath, parsedData);
}

/**
* Map the MAPPINGS object, applying each field spec to the parsed data.
* If the mapping value is an array, use it as the path to the extract the
* field's value. If it's an object, extract the value in object.path and pass
* it to the function in object.fun
*
* @param {array} mappings The mappings object
*/
function extractor (mappings) {
  return function extractFields (parsedData) {
    debug('parsedData: %o', parsedData);

    return R.map((spec) => {
      if (R.is(Array, spec)) {
        return R.path(spec, parsedData);
      }

      // extractDataWithServiceRequestId explanation:
      // https://github.com/facundoolano/google-play-scraper/pull/412
      // assume spec object
      let input;
      if (spec.useServiceRequestId) {
        input = extractDataWithServiceRequestId(parsedData, spec);
      } else {
        input = R.path(spec.path, parsedData);
        if ((input === null || input === undefined) && spec.fallbackPath) {
          input = R.path(spec.fallbackPath, parsedData);
        }
      }

      return spec.fun(input, parsedData);
    }, mappings);
  };
}

/*
 * Extract the javascript objects returned by the AF_initDataCallback functions
 * in the script tags of the app detail HTML.
 */
function parse (response) {
  const scriptRegex = />AF_initDataCallback[\s\S]*?<\/script/g;
  const keyRegex = /(ds:.*?)'/;
  const valueRegex = /data:([\s\S]*?), sideChannel: {}}\);<\//;

  const matches = response.match(scriptRegex);

  if (!matches) {
    return {};
  }

  const parsedData = matches.reduce((accum, data) => {
    const keyMatch = data.match(keyRegex);
    const valueMatch = data.match(valueRegex);

    if (keyMatch && valueMatch) {
      const key = keyMatch[1];
      const value = JSON.parse(valueMatch[1]);
      return R.assoc(key, value, accum);
    }
    return accum;
  }, {});

  return Object.assign(
    {},
    parsedData,
    { serviceRequestData: parseServiceRequests(response) }
  );
}

/*
 * Extract the javascript objects returned by the AF_dataServiceRequests function
 * in the script tags of the app detail HTML.
 */
function parseServiceRequests (response) {
  const scriptRegex = /; var AF_dataServiceRequests[\s\S]*?; var AF_initDataChunkQueue/g;
  const valueRegex = /{'ds:[\s\S]*}}/g;

  const matches = response.match(scriptRegex);

  if (!matches) {
    return {};
  }

  const [data] = matches;
  const valueMatch = data.match(valueRegex);

  if (!valueMatch) {
    return {};
  }

  // eslint-disable-next-line
  const value = eval(`(${valueMatch[0]})`);
  return value;
}

export default Object.assign({ parse, parseServiceRequests, extractor, extractDataWithServiceRequestId });
