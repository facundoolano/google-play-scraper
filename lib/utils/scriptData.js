'use strict';

const debug = require('debug')('google-play-scraper:scriptData');
const R = require('ramda');

function extractor (mappings) {
  /*
  * Map the MAPPINGS object, applying each field spec to the parsed data.
  * If the mapping value is an array, use it as the path to the extract the
  * field's value. If it's an object, extract the value in object.path and pass
  * it to the function in object.fun
  */
  return function extractFields (parsedData) {
    debug('parsedData: %o', parsedData);

    return R.map((spec) => {
      if (R.is(Array, spec)) {
        return R.path(spec, parsedData);
      }
      // assume spec object
      const input = R.path(spec.path, parsedData);
      return spec.fun(input);
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
  const valueRegex = /return ([\s\S]*?)}}\);<\//;

  const matches = response.match(scriptRegex);

  if (!matches) {
    return {};
  }

  return matches.reduce((accum, data) => {
    const keyMatch = data.match(keyRegex);
    const valueMatch = data.match(valueRegex);

    if (keyMatch && valueMatch) {
      const key = keyMatch[1];
      const value = JSON.parse(valueMatch[1]);
      return R.assoc(key, value, accum);
    }
    return accum;
  }, {});
}

module.exports = Object.assign({ parse, extractor });
