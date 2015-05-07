var Promise = require('promise');
var request = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');

var c = require('./constants');

function List(opts) {

	return new Promise(function (resolve, reject) {

		opts = opts || {};
		validate(opts);
        var url = buildUrl(opts);

        request(url)
            .then(cheerio.load, requestError)
            .then(parseList)
            .then(resolve)
            .catch(reject);
    });
}

function validate(opts) {
	if (opts.category && !(_.includes(c.category, opts.category))) {
		throw Error('Invalid category ' + opts.category);
	}

	opts.collection = opts.collection || c.collection.TOP_FREE;
	if (!(_.includes(c.collection, opts.collection))) {
		throw Error('Invalid collection ' + opts.collection);
	}

	opts.num = opts.num || 60;
	if (opts.num > 120) {
		throw Error('Cannot retrieve more than 120 apps at a time');
	}

	opts.start = opts.start || 0;
	if (opts.num > 500) {
		throw Error('The maximum starting index is 500');
	}

	opts.lang = opts.lang || 'en';
}

function buildUrl(opts) {
	var url = 'https://play.google.com/store/apps/';

	if (opts.category) {
		url += 'category/' + opts.category;
	}

	url += 'collection/' + opts.collection;
	url += '?hl=' + opts.lang + '&start=' + opts.start + '&num=' + opts.num;

	return url;
}

function requestError() {
    //TODO improve details
    throw Error('Error retrieving list');
}

function parseList($) {
	var apps = [];

	$('.card').each(function(i, v){
		apps.push(parseApp($, v));
	});

	return apps;
}

function parseApp($, app) {
	var price = $(app).find('.display-price').first().text();
	var free = price === 'FREE';
	if (free) {
		price = '0';
	}

	var scoreText = $(app).find(".tiny-star").attr("aria-label");
	var score = parseFloat(scoreText.match(/[\d.]+/)[0]);

	return {
		url: 'https://play.google.com' + $(app).find('a').attr('href'),
		appId: $(app).attr('data-docid'),
		title: $(app).find('.title').attr('title'),
		developer: $(app).find('.subtitle').text(),
		icon: $(app).find('.cover-image').attr('data-cover-large'),
		score: score,
		price: price,
		free: free
	};
}

module.exports = List;