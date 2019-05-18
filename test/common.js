'use strict';

const assert = require('chai').assert;
const validator = require('validator');

function assertValidUrl (url) {
  return assert(validator.isURL(url, { allow_protocol_relative_urls: true }),
    `${url} is not a valid url`);
}

function assertValidApp (app) {
  assert.isString(app.appId);
  assert.isString(app.title);
  assert.isString(app.summary);
  assertValidUrl(app.url);
  assertValidUrl(app.icon);

  if (app.score !== undefined) {
    // would fail for new apps without score
    assert.isNumber(app.score);
    assert(app.score >= 0);
    assert(app.score <= 5);
  }

  assert.isBoolean(app.free);

  // FIXME this is only allowed for preregister, check for that when field is available
  if (app.priceText !== undefined) {
    assert.isString(app.priceText);
  }

  return app;
}

module.exports = { assertValidUrl, assertValidApp };
