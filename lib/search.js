var Promise = require('bluebird'),
    rp = require('request-promise'),
    cheerio = require('cheerio');

var h = require('./helpers');

function search(opts) {
    initDefaultOptsValues(opts);

    return new Promise(function (resolve, reject) {

        var errors = validate(opts);

        if (errors.length !== 0) {
            console.log('error on validate: ' + errors[0].message);
            return reject(errors[0].message, null);
        }

        var query = {
            term: encodeURIComponent(opts.term),
            lang: opts.lang,
            country: opts.country,
            num: opts.num,
            apps: [],
            fullDetail: opts.fullDetail
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
    return url;
}

function doSearch(query) {

    function processResponse(html) {
        query.nextToken = getNextToken(html);
        var $ = cheerio.load(html);
        return h.getParseList(query)($);
    }

    function processApps(apps) {
        query.apps = query.apps.concat(apps);
        return query;
    }

    return rp(buildUrl(query))
        .then(processResponse, h.requestError)
        .then(processApps)
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

function initDefaultOptsValues(opts) {
    opts = opts || {};

    opts.num = opts.num || 20;
    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';
    opts.fullDetail = opts.fullDetail || false;
}

function validate(opts) {
    var schema = require('validate');
    var param = schema({
        term: {
            type: 'string',
            required: true,
            message: "Option 'term' is required."
        },
        num: {
            type: 'number',
            use: function (value) {
                return value <= 250;
            },
            message: "The number of results can't exceed 250."
        },
        lang: {
            type: 'string',
            message: "Invalid type for option 'lang'."
        },
        country: {
            type: 'string',
            message: "Invalid type for option 'country'."
        },
        fullDetail: {
            type: 'boolean',
            message: "Invalid type for option 'fullDetail'."
        }
    });

    return param.validate(opts);
}


module.exports = search;
