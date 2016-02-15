var Promise = require('bluebird');
var play = require('./google-play-scraper');

module.exports.requestError = function (reason) {
    if (reason.response && reason.response.statusCode === 404) {
        throw Error('App not found (404)');
    }

    throw Error('Error requesting Google Play:' + reason.message);
};

/*
 * Return the proper parseList function according to the options.
 */
module.exports.getParseList = function (opts) {

    if (opts.fullDetail) {
        return getParseDetailList(opts.lang, opts.country);
    }

    return parseList;
};

/*
 * Returns a parseList function that just grabs the appIds,
 * fetches every app detail with the app() function and returns
 * a Promise.all().
 */
function getParseDetailList(lang, country) {

    return function ($) {
        var promises = $('.card').get().map(function (app) {
            var appId = $(app).attr('data-docid');
            return play.app({
                appId: appId,
                lang: lang,
                country: country
            });
        });

        return Promise.all(promises);
    };

}

function parseList($) {
    return $('.card').get().map(function (app) {
        return parseApp($(app));
    });
}

function parseApp(app) {
    var price = app.find('span.display-price').first().text();

    //if price string contains numbers, it's not free
    var free = !/\d/.test(price);
    if (free) {
        price = '0';
    }

    var scoreText = app.find('div.tiny-star').attr('aria-label');
    var score;
    if (scoreText) {
        score = parseFloat(scoreText.match(/[\d.]+/)[0]);
    }

    return {
        url: 'https://play.google.com' + app.find('a').attr('href'),
        appId: app.attr('data-docid'),
        title: app.find('a.title').attr('title'),
        developer: app.find('a.subtitle').text(),
        icon: app.find('img.cover-image').attr('data-cover-large'),
        score: score,
        price: price,
        free: free
    };
}
