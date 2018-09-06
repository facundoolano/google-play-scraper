'use strict';

const request = require('./utils/request');
const R = require('ramda');

const isPermission = (item) => R.is(Array, item) && item.length === 3 && R.is(String, item[0]) && R.is(String, item[1]);

function parsePermissions (items) {
  return items.reduce((results, item) => {
    if (isPermission(item)) {
      return R.append({
        permission: item[0],
        description: item[1]
      }, results);
    }
    if (R.is(Array, item)) {
      return results.concat(parsePermissions(item));
    }
    return results;
  }, []);
}

function permissions (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts && !opts.appId) {
      throw Error('appId missing');
    }

    const options = Object.assign({
      method: 'POST',
      url: 'https://play.google.com/store/xhr/getdoc?authuser=0',
      form: {
        ids: opts.appId,
        hl: opts.lang || 'en',
        xhr: 1
      },
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
    .then(function (res) {
      // remove leading garbage and insert nulls in missing array elements
      res = res.slice(5).replace(/,,/g, ',null,').replace(/,,/g, ',null,').replace(/\[,/g, '[null,');
      res = JSON.parse(res);
      // grab the array that contains all the permission definitions
      // this doesnt look too solid but well
      return {
        appId: res[0][2][0][0],
        items: res[0][2][0][65]['42656262'][1] || []
      };
    })
    .then(function (res) {
      return {
        appId: res.appId,
        permissions: parsePermissions(res.items)
      }
    })
    .then((perms) => {
      if (opts.short) {
        return R.pluck('permission', perms.permissions);
      }
      return perms;
    })
    .then(resolve)
    .catch(reject);
  });
}

module.exports = permissions;
