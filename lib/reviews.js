var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');

var c = require('./constants');
var h = require('./helpers');

function reviews(opts) {

	return new Promise(function(resolve, reject) {

		validate(opts);

		var sort = convertSort(opts.sort);

		var options = {
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
	reviewsContainer.each(function(i) {
		var info = $(this).find('div[class=review-info]');
		var userInfo = info.find('a');
		var userId = filterUserId(userInfo.attr('href'));
		var userName = userInfo.text().trim();

		var date = $(this).find('span[class=review-date]').text().trim();
		var score = parseInt(filterScore($(this).find('.star-rating-non-editable-container').attr('aria-label').trim()));

		var reviewContent = $(this).find('.review-body');
		var title = reviewContent.find('span[class=review-title]').text().trim();
		var text = filterReviewText(reviewContent.text().trim(), title.length);

		var allInfo = {
			userId: userId,
			userName: userName,
			date: date,
			score: score,
			title: title,
			text: text
		};

		result[i] = allInfo;
	});
	return result;
}

function validate(opts) {
	if (!opts || !opts.appId) {
        throw Error('appId missing');
    }

	if (opts.sort && !(_.includes(c.sort, opts.sort))) {
		throw new Error('Invalid sort ' + opts.sort);
	}
	if (opts.page && opts.page < 0) {
		throw new Error('Page cannot be lower than 0');
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
		default:
			return 0;
	}
}

function filterReviewText(text, startIndex) {
	var regex = /Full Review/;
	var result = text.substring(startIndex).replace(regex, '').trim();
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

module.exports = reviews;
