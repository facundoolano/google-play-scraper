'use strict';

const { processPermissions } = require('./requesters/permissionMappedRequests');

function permissions (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts && !opts.appId) {
      throw Error('appId missing');
    }

    opts.lang = opts.lang || 'en';

    processPermissions(opts)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = permissions;
