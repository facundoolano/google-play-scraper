'use strict';

const BASE_URL = 'https://play.google.com';
const CLUSTER_BASE_URL = `${BASE_URL}/store/apps`;

const DEFAULT_PARAMETERS = {
  similar: {
    lang: 'en',
    country: 'us',
    fullDetail: false
  }
};

module.exports = {
  BASE_URL,
  CLUSTER_BASE_URL,
  DEFAULT_PARAMETERS
};
