var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');

var c = require('./constants');
var h = require('./helpers');

function list(opts) {

    return new Promise(function (resolve, reject) {

        opts = opts || {};
        validate(opts);
        var url = buildUrl(opts);

        request(url)
            .then(cheerio.load, h.requestError)
            .then(h.getParseList(opts))
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

    if (opts.age && !(_.includes(c.age, opts.age))) {
        throw Error('Invalid age range ' + opts.age);
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
    opts.country = opts.country || 'us';
}

function buildUrl(opts) {
    var url = 'https://play.google.com/store/apps';

    if (opts.category) {
        url += '/category/' + opts.category;
    }

    url += '/collection/' + opts.collection;
    url += '?hl=' + opts.lang + '&gl=' + opts.country + '&start=' + opts.start
                + '&num=' + opts.num;

    if (opts.age) {
        url += '&age=' + opts.age;
    }

    return url;
}

module.exports = list;
