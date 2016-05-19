'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const R = require('ramda');

const c = require('./constants');
const h = require('./helpers');

function reviews (opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);

    const sort = convertSort(opts.sort);

    const options = {
      method: 'POST',
      uri: 'https://play.google.com/store/getreviews',
      form: {
        pageNum: opts.page || 0,
        id: opts.appId || opts.id,
        reviewSortOrder: sort,
        hl: opts.lang || 'en',
        reviewType: 0,
        xhr: 1
      },
      json: true
    };

    request(options)
      .then(function (body) {
        const response = JSON.parse(body.slice(6));
        return response[0][2];
      })
      .then(cheerio.load, h.requestError)
      .then(parseFields)
      .then(resolve)
      .catch(reject);
  });
}

function parseFields ($) {
  const result = [];

  const reviewsContainer = $('div[class=single-review]');
  reviewsContainer.each(function (i) {
    const info = $(this).find('div[class=review-info]');
    const userInfo = info.find('a');
    const userId = filterUserId(userInfo.attr('href'));
    const userName = userInfo.text().trim();

    const date = $(this).find('span[class=review-date]').text().trim();
    const score = parseInt(filterScore($(this).find('.star-rating-non-editable-container').attr('aria-label').trim()));

    const reviewContent = $(this).find('.review-body');
    const title = reviewContent.find('span[class=review-title]').text().trim();
    const text = filterReviewText(reviewContent.text().trim(), title.length);

    const developerComment = $(this).next('.developer-reply');
    let replyDate;
    let replyText;
    if (developerComment.length) {
      replyDate = developerComment.find('span.review-date').text().trim();
      replyText = developerComment.children().remove().end().text().trim();
    }

    const allInfo = {
      userId,
      userName,
      date,
      score,
      title,
      text,
      replyDate,
      replyText
    };

    result[i] = allInfo;
  });
  return result;
}

function validate (opts) {
  if (!opts || !opts.appId) {
    throw Error('appId missing');
  }

  if (opts.sort && !R.contains(opts.sort, R.values(c.sort))) {
    throw new Error('Invalid sort ' + opts.sort);
  }
  if (opts.page && opts.page < 0) {
    throw new Error('Page cannot be lower than 0');
  }
}

function convertSort (sort) {
  switch (sort) {
    case 'newest':
      return 0;
    case 'rating':
      return 1;
    case 'helpfulness':
      return 4;
    default:
      return 0;
  }
}

function filterReviewText (text, startIndex) {
  const regex = /Full Review/;
  const result = text.substring(startIndex).replace(regex, '').trim();
  return result;
}

function filterUserId (userId) {
  const regex = /id=([0-9]*)/;
  const result = userId.match(regex);
  return result[1];
}

function filterScore (score) {
  const regex = /([0-5]{1})/;
  const result = score.match(regex);
  return result[1];
}

module.exports = reviews;
