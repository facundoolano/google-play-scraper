var Promise = require('promise');
var request = require('request-promise');
var cheerio = require('cheerio');

var h = require('./helpers');


function app(id, lang) {
    var lang = lang || 'en';

    return new Promise(function (resolve, reject) {
        var url = 'https://play.google.com/store/apps/details?id=' + id + '&hl=' + lang;
        request(url)
            .then(cheerio.load, h.requestError)
            .then(parseFields)
            .then(function(app) {
                app.url = url;
                app.appId = id;
                resolve(app);
            })
            .catch(reject);
    });
}

function parseFields($) {
    var installs = $('[itemprop="numDownloads"]').text().trim();
    var minInstalls = cleanInt(installs.split(' - ')[0]);
    var maxInstalls = cleanInt(installs.split(' - ')[1]) || undefined;

    //for other languages
    var score = parseFloat($('.score').text().replace(',', '.')) || 0;
    var price = $('[itemprop=price]').attr('content');
    var video = $('[data-video-url]').attr('data-video-url');
    if (video) {
        video = video.split('?')[0];
    }

    return {
        title: $('.document-title').text().trim(),
        icon: $('.cover-image').attr('src'),
        minInstalls: minInstalls,
        maxInstalls: maxInstalls,
        score: score,
        reviews: cleanInt($('.reviews-num').text()),
        description: $('.id-app-orig-desc').text(),
        descriptionHTML: $('.id-app-orig-desc').html(),
        developer: $('[itemprop="author"] [itemprop="name"]').text(),
        genre: $('[itemprop="genre"]').text(),
        price: price,
        free: price == '0',
        video: video
    };
}

function cleanInt(number) {
    var number = number || '0';
    //removes thousands separator
    number = number.replace(/,/g, '').replace(/\./g, '');
    return parseInt(number);
}

module.exports = app;
