var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');

var c = require('./constants');
var h = require('./helpers');

function review(opts) {

	return new Promise(function(resolve, reject) {

		opts = opts || {};
		validate(opts);

		var sort = convertSort(opts.sort);

		var options = {
			method: 'POST',
			uri: 'https://play.google.com/store/getreviews',
			form: {
				reviewType: opts.reviewType || 0,
				pageNum: opts.page || 0,
				id: opts.id,
				reviewSortOrder: sort,
				hl: opts.lang || 'en'
			},
			json: true
		}

		request(options)
			.then(function(body){
				var response = JSON.parse(body.slice(6));
				return response[0][2];
			})
			.then(cheerio.load, h.requestError)
			.then(parseFields)
			.then(resolve)
			.catch(reject);
	});
}

function parseFields($) {
	var result = [];

	var reviewsContainer = $('div[class=single-review]');
	reviewsContainer.each(function(i, elem) {
		var info = $(this).find('div[class=review-info]');
		var userInfo = info.find('a');
		var userId = filterUserId(userInfo.attr('href'));
		var userName = userInfo.text().trim();

		var date = $(this).find('span[class=review-date]').text().trim();
		var score = filterScore($('.star-rating-non-editable-container').attr('aria-label').trim());
		
		var reviewContent = $(this).find('div[class=review-body]');
		var reviewTitle = reviewContent.find('span[class=review-title]').text().trim();
		var reviewText = reviewContent.text().trim();
		var reviewText = filterReviewText(reviewText, reviewTitle.length);

		var allInfo = {
			userId: userId,
			userName: userName,
			date: date,
			score: score,
			reviewTitle: reviewTitle,
			reviewText: reviewText
		};

		result[i] = allInfo;
	});
	return result;
}

function validate(opts) {
	if (opts.sort && !(_.includes(c.sort, opts.sort))) {
		throw new Error('Invalid sort ' + opts.sort);
	}
	if (opts.page && opts.page < 0) {
		throw new Error('Page cannot be lower than 0');
	}
	if (opts.reviewType && !(opts.reviewType >= 0 && opts.reviewType <=1)) {
		throw new Error('Review type is not valid.');
	}
}

function convertSort(sort) {
	switch (sort) {
		case 'newest':
			return 0;
		case 'rating':
			return 1;
		case 'helpfulness':
			return 4;
	}
}

function filterReviewText(reviewText, startIndex) {
	var regex = /Full Review/;
	var result = reviewText.substring(startIndex).replace(regex, "").trim();
	return result;
}

function filterUserId(userId) {
	var regex = /id=([0-9]*)/;
	var result = userId.match(regex);
	return result[1];
}

function filterScore(score) {
	var regex = /([0-5]{1})/;
	var result = score.match(regex);
	return result[1];
}

module.exports = review;