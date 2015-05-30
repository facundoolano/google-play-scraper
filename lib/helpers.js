
module.exports.requestError = function() {
    //TODO improve details
    throw Error('Error requesting Google Play');
};

module.exports.parseList = function($) {
    return $('.card').get().map(function(app){
        return parseApp($(app));
    });
};

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
