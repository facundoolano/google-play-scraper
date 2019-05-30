'use strict';

var R = require('ramda');

function extractor(mappings) {
  /*
  * Map the MAPPINGS object, applying each field spec to the parsed data.
  * If the mapping value is an array, use it as the path to the extract the
  * field's value. If it's an object, extract the value in object.path and pass
  * it to the function in object.fun
  */
  return function extractFields(parsedData) {
    return R.map(function (spec) {
      if (R.is(Array, spec)) {
        return R.path(spec, parsedData);
      }
      // assume spec object
      var input = R.path(spec.path, parsedData);
      return spec.fun(input);
    }, mappings);
  };
}

/*
 * Extract the javascript objects returned by the AF_initDataCallback functions
 * in the script tags of the app detail HTML.
 */
function parse(response) {
  var scriptRegex = />AF_initDataCallback[\s\S]*?<\/script/g;
  var keyRegex = /(ds:.*?)'/;
  var valueRegex = /return ([\s\S]*?)}}\);<\//;

  var matches = response.match(scriptRegex);

  if (!matches) {
    return {};
  }

  return matches.reduce(function (accum, data) {
    var keyMatch = data.match(keyRegex);
    var valueMatch = data.match(valueRegex);

    if (keyMatch && valueMatch) {
      var key = keyMatch[1];
      var value = JSON.parse(valueMatch[1]);
      return R.assoc(key, value, accum);
    }
    return accum;
  }, {});
}

module.exports = Object.assign({ parse: parse, extractor: extractor });