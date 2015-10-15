var Promise = require('bluebird'),
    rp = require('request-promise'),
    _ = require('lodash');

function suggest(term) {

    return new Promise(function (resolve, reject) {
        var query = {
            term: encodeURIComponent(term)
        };

        var errors = validate(query);

        if (errors.length !== 0) {
            console.log('error on validate: ' + errors[0].message);
            return reject(errors[0].message, null);
        }

        rp({
                url: buildUrl(query),
                json: true
            })
            .then(function (res) {
                var suggestions = _.pluck(res, 's');
                resolve(suggestions);
            })
            .catch(reject);
    });
}

function buildUrl(query) {
    return 'https://market.android.com/suggest/SuggRequest?json=1&c=3&query=' + query.term;
}

function validate(query) {
    var schema = require('validate');
    var param = schema({
        term: {
            type: 'string',
            required: true,
            message: "Parameter 'term' is required."
        }
    });

    return param.validate(query);
}

module.exports = suggest;
