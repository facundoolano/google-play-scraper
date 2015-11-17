var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');
var h = require('./helpers');

function review(opts) {

	return new Promise(function(resolve, reject) {

		opts = opts || {};

		var options = {
			method: 'POST',
			uri: 'https://play.google.com/store/getreviews',
			qs: { 
				authuser: '0' 
			},
			headers: { 
				'cache-control': 'no-cache',
				'content-type': 'application/json' 
			},
			form: {
				reviewType: opts.reviewType || 0,
				pageNum: opts.pageNum || 0,
				id: opts.id,
				reviewSortOrder: opts.reviewSortOrder || 1,
				xhr: 1,
				hl: opts.hl || 'en'
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
	var reviewContent = $('div[class=review-header]');
	var review = [];
	reviewContent.each(function(i, elem) {
		var userInfo = $(this).find('a');
		var userId = filterUserId(userInfo.attr('href'));
		var userName = userInfo.text().trim();

		var dateReviewPosted = $(this).find('span[class=review-date]').text().trim();
		var rating = filterRating($('.star-rating-non-editable-container').attr('aria-label').trim());
		
		var allInfo = {
			userId: userId,
			userName: userName,
			dateReviewPosted: dateReviewPosted,
			rating: rating
		};

		review[i] = allInfo;
	});

	return review;
}

function filterUserId(userId) {
	var regex = /id=([0-9]*)/;
	var result = userId.match(regex);
	return result[1];
}

function filterRating(rating) {
	var regex = /([0-5]{1})/;
	var result = rating.match(regex);
	return result[1];
}

module.exports = review;