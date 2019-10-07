'use strict';

const R = require('ramda');
const scriptData = require('./scriptData');

function getPermissionMappings (type) {
  const MAPPINGS = {
    permission: [1],
    type: {
      path: 0,
      fun: () => type
    }
  };

  return MAPPINGS;
}

function extract (root, data, type) {
  const input = R.path(root, data);

  if (typeof input === 'undefined') {
    return [];
  }

  const MAPPINGS = getPermissionMappings(type);
  return R.map(scriptData.extractor(MAPPINGS), input);
}

module.exports = { getPermissionMappings, extract };
