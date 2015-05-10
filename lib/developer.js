var Promise = require('promise');
var request = require('request-promise');
var cheerio = require('cheerio');

var h = require('./helpers');

function developer(devId, lang) {

    return new Promise(function (resolve, reject) {
        devId = encodeURIComponent(devId);
        lang = lang || 'en';
        var url = 'https://play.google.com/store/apps/developer?id=' + devId + '&hl=' + lang;

        request(url)
            .then(cheerio.load, h.requestError)
            .then(h.parseList)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = developer;
