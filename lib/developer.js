var Promise = require('bluebird'),
    rp = require('request-promise'),
    cheerio = require('cheerio');

var h = require('./helpers');

function developer(opts) {
    initDefaultOptsValues(opts);

    return new Promise(function (resolve, reject) {
        var errors = validate(opts);

        if (errors.length !== 0) {
            console.log('error on validate: ' + errors[0].message);
            return reject(errors[0].message, null);
        }

        rp(buildUrl(opts))
            .then(cheerio.load, h.requestError)
            .then(h.getParseList(opts))
            .then(resolve)
            .catch(reject);
    });
}

function initDefaultOptsValues(opts) {
    opts = opts || {};

    opts.num = opts.num || 60;
    opts.lang = opts.lang || 'en';
}

function buildUrl(opts) {
    var url = 'https://play.google.com/store/apps/developer';
    url += '?id=' + encodeURIComponent(opts.devId);
    url += '&hl=' + opts.lang + '&num=' + opts.num;
    return url;
}

function validate(opts) {
    var schema = require('validate');
    var param = schema({
        devId: {
            type: 'string',
            required: true,
            message: "Parameter 'devId' is required."
        },
        num: {
            type: 'number',
            use: function (value) {
                return value <= 120;
            },
            message: "Cannot retrieve more than 120 apps at a time."
        },
        lang: {
            type: 'string',
            message: "Invalid type for option 'lang'."
        }
    });

    return param.validate(opts);
}

module.exports = developer;
