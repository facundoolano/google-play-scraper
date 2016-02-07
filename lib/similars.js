/**
 * Created by Eran Goldman on 25/01/16.
 */

var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var playStoreUrl = 'https://play.google.com/store/apps/similar';
var queryString = require('querystring');
var url = require('url');

var h = require('./helpers');


function app(id, lang) {
    lang = lang || 'en';

    return new Promise(function (resolve, reject) {
        var reqUrl = url.parse(playStoreUrl + '?' + queryString.stringify({id: id, hl: lang}));
        request(reqUrl.href)
            .then(cheerio.load, h.requestError)
            .then(parseFields)
            .then(function (apps) {
                //app.url = reqUrl.href;
                //app.appId = id;
                resolve(apps);
            })
            .catch(reject);
    });
}

function parseFields($) {
    var apps = [];
    $(".card-content").each(function(i){apps[i] = $(this).data("docid")});
    return apps;
}

function cleanInt(number) {
    number = number || '0';
    //removes thousands separator
    number = number.replace(/\D/g, '');
    return parseInt(number);
}

module.exports = app;

