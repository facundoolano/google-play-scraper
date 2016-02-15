var Promise = require('bluebird');
var request = require('request-promise');
var _ = require('lodash');

function suggest(term) {

    return new Promise(function (resolve, reject) {
        if (!term) {
            throw Error('term missing');
        }

        term = encodeURIComponent(term);
        var url = 'https://market.android.com/suggest/SuggRequest?json=1&c=3&query=' + term;
        request({
                url: url,
                json: true
            })
            .then(function (res) {
                var suggestions = _.map(res, 's');
                resolve(suggestions);
            })
            .catch(reject);
    });
}

module.exports = suggest;
