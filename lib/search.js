var Promise = require('promise');
var request = require('request-promise');
var cheerio = require('cheerio');

var h = require('./helpers');

function search(opts) {

    return new Promise(function (resolve, reject) {

        if (opts.num && opts.num > 250) {
            throw Error("The number of results can't exceed 250");
        }

        var query = {
            term: encodeURIComponent(opts.term),
            lang: opts.lang || 'en',
            country: opts.country || 'us',
            num: opts.num || 20,
            apps: []
        };

        doSearch(query)
            .then(resolve)
            .catch(reject);
    });
}

function buildUrl(query) {
    var url = 'https://play.google.com/store/search?c=apps&q=' + query.term + '&hl=' + query.lang + '&gl=' + query.country;

    if (query.nextToken) {
        url += '&pagTok=' + query.nextToken;
    }
    console.log(url)
    return url;
}

function doSearch(query) {

    function processResponse(html) {
        query.nextToken = getNextToken(html);
        var $ = cheerio.load(html);
        var apps = h.parseList($);
        query.apps = query.apps.concat(apps);
        return query;
    }

    return request(buildUrl(query))
        .then(processResponse, h.requestError)
        .then(checkFinished);
}

function getNextToken(html) {
    //extract the token for the next page request
    //for the record, I hate regexps
    var s = html.match(/\\42(GAE.+?)\\42/);
    if (!s) {
        return undefined;
    }
    return s[1].replace(/\\\\u003d/g, '=');
}

function checkFinished(query) {
    //if enough resutls or no more pages, return
    if (query.apps.length >= query.num || !query.nextToken) {
        return query.apps.slice(0, query.num);
    }

    //else fetch next page
    return doSearch(query);
}

module.exports = search;
