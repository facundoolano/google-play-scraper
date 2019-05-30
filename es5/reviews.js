'use strict';

var request = require('./utils/request');
var cheerio = require('cheerio');
var R = require('ramda');

var c = require('./constants');

function reviews(opts) {
  return new Promise(function (resolve, reject) {
    validate(opts);

    var options = Object.assign({
      method: 'POST',
      uri: 'https://play.google.com/store/getreviews',
      form: {
        pageNum: opts.page || 0,
        id: opts.appId || opts.id,
        reviewSortOrder: opts.sort || c.sort.NEWEST,
        hl: opts.lang || 'en',
        reviewType: 0,
        xhr: 1
      },
      json: true,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle).then(function (body) {
      var response = JSON.parse(body.slice(6));
      return response[0][2];
    }).then(cheerio.load).then(parseFields).then(resolve).catch(function (err) {
      // as of 2/10/2018 google fails with a 400 status starting on page 112
      // assuming no more results when status is 400
      if (err.status === 400) {
        return resolve([]);
      }
      reject(err);
    });
  });
}

function getUserImage($, handle) {
  var spanElem = $(handle).find('span[class=responsive-img-hdpi] > span');
  var style = spanElem.length && spanElem.css('background-image');
  // Style is in the form of url(https://lh5.googleusercontent.com/.../photo.jpg)
  var match = style && style.match('url\\((.*)\\)');
  return match ? match[1] : undefined;
}

function parseFields($) {
  var result = [];

  var reviewsContainer = $('div[class=single-review]');
  reviewsContainer.each(function (i) {
    var id = $(this).find('div[class=review-header]').data('reviewid').trim();
    var info = $(this).find('div[class=review-info]');
    var userName = $(this).find('span[class=author-name]').text().trim();
    var userImage = getUserImage($, this);
    var date = $(this).find('span[class=review-date]').text().trim();
    var score = parseInt(filterScore($(this).find('.star-rating-non-editable-container').attr('aria-label').trim()));
    var url = 'https://play.google.com' + info.find('.reviews-permalink').attr('href');

    var reviewContent = $(this).find('.review-body');
    var title = reviewContent.find('span[class=review-title]').text().trim();
    reviewContent.find('.review-link').remove();
    var text = reviewContent.text().trim();

    var developerComment = $(this).next('.developer-reply');
    var replyDate = void 0;
    var replyText = void 0;
    if (developerComment.length) {
      replyDate = developerComment.find('span.review-date').text().trim();
      replyText = developerComment.children().remove().end().text().trim();
    }

    var allInfo = {
      id: id,
      userName: userName,
      userImage: userImage,
      date: date,
      url: url,
      score: score,
      title: title,
      text: text,
      replyDate: replyDate,
      replyText: replyText
    };

    result[i] = allInfo;
  });
  return result;
}

function validate(opts) {
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

function filterScore(score) {
  // take the lower number, they're switched in japanese language
  var numbers = score.match(/([0-5])/g);
  return R.apply(Math.min, numbers);
}

module.exports = reviews;