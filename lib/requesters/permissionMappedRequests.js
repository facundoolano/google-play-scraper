'use strict';

const debug = require('debug')('google-play-scraper:permissionsMappedRequests');
const R = require('ramda');
const request = require('../utils/request');
const scriptData = require('../utils/scriptData');
const { BASE_URL } = require('../utils/configurations');
const permissionList = require('../utils/permissionList');

function processPermissionData (html, opts) {
  if (R.is(String, html)) {
    html = scriptData.parse(html);
  }

  if (opts.short) {
    const permissionNames = R.chain(permission => permission[0], html[0]);
    return permissionNames;
  }

  const flatMapPermissions = permission => permissionList.extract([2], permission, permission[0]);
  const commonPermissions = R.chain(flatMapPermissions, html[0]);
  const otherPermissions = R.chain(flatMapPermissions, html[1]);
  const unknownPermissions = permissionList.extract([2], html, '');

  return [
    ...commonPermissions,
    ...otherPermissions,
    ...unknownPermissions
  ];
}

function processPermissions (opts) {
  const body = `f.req=%5B%5B%5B%22xdSrCf%22%2C%22%5B%5Bnull%2C%5B%5C%22${opts.appId}%5C%22%2C7%5D%2C%5B%5D%5D%5D%22%2Cnull%2C%221%22%5D%5D%5D`;
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${opts.lang}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const requestOptions = Object.assign({
    url,
    method: 'POST',
    body,
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  return request(requestOptions, opts.throttle)
    .then((html) => {
      const input = JSON.parse(html.substring(5));
      const data = JSON.parse(input[0][2]);

      return (data === null)
        ? []
        : processPermissionData(data, opts);
    });
}

module.exports = {
  processPermissions
};
