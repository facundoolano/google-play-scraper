'use strict';

var request = require('./utils/request');
var queryString = require('querystring');
var scriptData = require('./utils/scriptData');
var appList = require('./utils/appList');

var PLAYSTORE_URL = 'https://play.google.com/store/apps/details';

function similar(opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.appId = encodeURIComponent(opts.appId);
    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';

    var qs = queryString.stringify({
      id: opts.appId,
      hl: opts.lang,
      gl: opts.country
    });
    var reqUrl = PLAYSTORE_URL + '?' + qs;

    var options = Object.assign({
      url: reqUrl,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle).then(scriptData.parse).then(scriptData.extractor(PATH_MAPPING)).then(function (data) {
      if (data.path === undefined) {
        throw Error('not found similar link');
      }
      return request(Object.assign({
        url: 'https://play.google.com' + data.path + '&gl=' + opts.country + '&hl=' + opts.lang,
        followAllRedirects: true
      }, opts.requestOptions));
    }).then(scriptData.parse).then(function (parsed) {
      return appList.extract(['ds:3', 0, 1, 0, 0, 0], parsed);
    }).then(resolve).catch(reject);
  });
}

var PATH_MAPPING = {
  path: ['ds:6', 1, 1, 0, 0, 3, 4, 2]
};

module.exports = similar;