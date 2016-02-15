var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');

var h = require('./helpers');

function similar(opts) {

    return new Promise(function (resolve, reject) {

        if (!opts || !opts.appId) {
            throw Error('appId missing');
        }

        opts.lang = opts.lang || 'en';
        var url = buildUrl(opts);

        request(url)
            .then(cheerio.load, h.requestError)
            .then(h.getParseList(opts))
            .then(resolve)
            .catch(reject);
    });
}

function buildUrl(opts) {
    var url = 'https://play.google.com/store/apps/similar';
    url += '?id=' + encodeURIComponent(opts.appId);
    url += '&hl=' + opts.lang;
    return url;
}

module.exports = similar;
