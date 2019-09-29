'use strict';

const INITIAL_MAPPINGS = {
  cluster: ['ds:3', 0, 1, 0, 0, 3, 4, 2],
  apps: ['ds:3', 0, 1, 0, 0, 0],
  token: ['ds:3', 0, 1, 0, 0, 7, 1]
};

const REQUEST_MAPPINGS = {
  token: [0, 0, 7, 1],
  apps: [0, 0, 0]
};

module.exports = {
  INITIAL_MAPPINGS,
  REQUEST_MAPPINGS
};
