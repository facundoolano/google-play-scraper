'use strict';

const R = require('ramda');

module.exports = function generateExtractFieldsFn (mappings) {
  /*
  * Map the MAPPINGS object, applying each field spec to the parsed data.
  * If the mapping value is an array, use it as the path to the extract the
  * field's value. If it's an object, extract the value in object.path and pass
  * it to the function in object.fun
  */
  return function extractFields (parsedData) {
    return R.map((spec) => {
      if (R.is(Array, spec)) {
        return R.path(spec, parsedData);
      }
      // assume spec object
      const input = R.path(spec.path, parsedData);
      return spec.fun(input);
    }, mappings);
  };
};
