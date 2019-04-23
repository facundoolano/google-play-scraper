'use strict';
const R = require('ramda');

/*
 * Extract the javascript objects returned by the AF_initDataCallback functions
 * in the script tags of the app detail HTML.
 */
function matchScriptData (response) {
  const scriptRegex = />AF_initDataCallback[\s\S]*?<\/script/g;
  const keyRegex = /(ds:.*?)'/;
  const valueRegex = /return ([\s\S]*?)}}\);<\//;

  return response.match(scriptRegex)
    .reduce((accum, data) => {
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

module.exports = matchScriptData;
