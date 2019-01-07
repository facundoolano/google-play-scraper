'use strict';

/*
 * Return the proper parseList function according to the options.
 */
function getParseList (getApp, opts) {
  if (opts.fullDetail) {
    return getParseDetailList(getApp, opts);
  }

  return ($) => Promise.resolve(parseList($));
}

/*
 * Returns a parseList function that just grabs the appIds,
 * fetches every app detail with the app() function and returns
 * a Promise.all().
 */
function getParseDetailList (getApp, opts) {
  return function ($) {
    const promises = $('.card').get().slice(0, opts.num).map(function (app) {
      const appId = $(app).attr('data-docid');
      return getApp({
        appId: appId,
        lang: opts.lang,
        country: opts.country,
        cache: opts.cache
      });
    });

    return Promise.all(promises);
  };
}

function parseList ($) {
  return $('.WHE7ib').get().map(function (app) {
    return parseApp($(app));
  });
}

function parseApp (app) {
  let price = app.find('span.display-price').first().text();

  // if price string contains numbers, it's not free
  const free = !/\d/.test(price);

  const scoreText = app.find('div.tiny-star').attr('aria-label');
  let score;
  if (scoreText) {
    score = parseFloat(scoreText.match(/[\d.]+/)[0]);
  }

  return {
    url: 'https://play.google.com' + app.find('a').attr('href'),
    appId: app.find('a').attr('href').split('=')[1],
    title: app.find('div.b8cIId').attr('title'),
    summary: app.find('.b8cIId a').text().trim(),
    developer: app.find('a.mnKHRc').text(),
    developerId: app.find('a.mnKHRc').attr('href').split('id=')[1],
    icon: app.find('img.T75of').attr('data-src'),
    score: score,
    scoreText: scoreText,
    priceText: price,
    free: free
  };
}

module.exports = getParseList;
