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
  // console.log($.html());
  // const fs = require('fs');
  // fs.writeFile("/tmp/ABC.html", $.html(), function(err) {
  //     if(err) {
  //         return console.log(err);
  //     }

  //     console.log("The file was saved!");
  // }); 
  // console.log($('.WHE7ib').get());
  return $('.WHE7ib').get().map(function (app) {
    // console.log($(app));
    return parseApp($(app));
  });
}

function splittoken(body, token)
{
  return body.substring(body.search(token)+token.length);
   
}

function parseApp (app) {
  // console.log(app);
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
    appId: splittoken(app.find('a').attr('href'), "id="),
    title: app.find('div.b8cIId').attr('title'),
    summary: 'sum',
    developer: app.find('a.mnKHRc').text(),
    developerId: splittoken(app.find('a.mnKHRc').attr('href'), "id="),
     icon: app.find('img.T75of').attr('data-src'),
     score: 0,
     scoreText: 0,
     priceText: 0,
     free: false
  };
}

module.exports = getParseList;
