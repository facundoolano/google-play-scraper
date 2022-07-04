'use strict';

const debug = require('debug')('google-play-scraper:scriptData');
const R = require('ramda');
const helper = require('./mappingHelpers');
/**
* This method looks for the mapping inside the serviceRequestData object
* The serviceRequestData object is mapped from the AF_dataServiceRequests html var
*
* @param {object} parsedData The response mapped object
* @param {object} spec The mappings spec
* @param {string} serviceRequestId optional id to retrieve key node from service request data
                  This id will be ignored if the spec itself has an id defined
*/
function extractDataWithServiceRequestId (parsedData, spec, serviceRequestId) {
  const serviceRequestMapping = Object.keys(parsedData.serviceRequestData);
  const filteredDsRootPath = serviceRequestMapping.filter(serviceRequest => {
    const dsValues = parsedData.serviceRequestData[serviceRequest];

    return dsValues.id === (spec.useServiceRequestId || serviceRequestId);
  });

  const formattedPath = (filteredDsRootPath.length)
    ? [filteredDsRootPath[0], ...helper.getPathOfSpec(spec)]
    : helper.getPathOfSpec(spec);

  return R.path(formattedPath, parsedData);
}

/**
* Map the MAPPINGS object, applying each field spec to the parsed data.
* If the mapping value is an array, use it as the path to the extract the
* field's value. If it's an object, extract the value in object.path and pass
* it to the function in object.fun
*
* @param {array} mappings The mappings object
* @param {string} serviceRequestId optional id for whole extraction used to identify the node with given id
*/
function extractor (mappings, serviceRequestId) {
  return function extractFields (parsedData) {
    debug('parsedData: %o', parsedData);

    return R.map((spec) => {
      // extractDataWithServiceRequestId explanation:
      // https://github.com/facundoolano/google-play-scraper/pull/412
      // assume spec object
      const input = (spec.useServiceRequestId || serviceRequestId)
        ? extractDataWithServiceRequestId(parsedData, spec, serviceRequestId)
        : R.path(helper.getPathOfSpec(spec), parsedData);

      return R.is(Function, spec.fun) ? spec.fun(input, parsedData) : input;
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

module.exports = Object.assign({ parse, parseServiceRequests, extractor });
