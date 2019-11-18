'use strict';

const INITIAL_MAPPINGS = {
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1],
  collections: ['ds:3', 0, 1]
};

const REQUEST_MAPPINGS = {
  apps: [0, 0, 0],
  token: [0, 0, 7, 1]
};

module.exports = {
  INITIAL_MAPPINGS,
  REQUEST_MAPPINGS
};
