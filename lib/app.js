'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const queryString = require('querystring');
const url = require('url');

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details';

function app (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts || !opts.appId) {
      throw Error('appId missing');
    }

    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';

    const qs = queryString.stringify({
      id: opts.appId,
      hl: opts.lang,
      gl: opts.country
    });
    const reqUrl = `${PLAYSTORE_URL}?${qs}`;

    request(reqUrl)
      .then(cheerio.load, require('./helpers').requestError) // FIXME avoid cyclic require
      .then(parseFields)
      .then(function (app) {
        app.url = reqUrl;
        app.appId = opts.appId;
        resolve(app);
      })
      .catch(reject);
  });
}

function parseFields ($) {
  const detailsInfo = $('.details-info');
  const title = detailsInfo.find('div.document-title').text().trim();
  const developer = detailsInfo.find('span[itemprop="name"]').text();

  const mainGenre = detailsInfo.find('.category').first();
  const genreText = mainGenre.text().trim();
  const genreId = mainGenre.attr('href').split('/')[4];

  const familyGenre = detailsInfo.find('.category[href*="FAMILY"]');
  let familyGenreText;
  let familyGenreId;
  if (familyGenre.length) {
    familyGenreText = familyGenre.text().trim() || undefined;
    familyGenreId = familyGenre.attr('href').split('/')[4];
  }

  const price = detailsInfo.find('meta[itemprop=price]').attr('content');
  const icon = detailsInfo.find('img.cover-image').attr('src');
  const offersIAP = !!detailsInfo.find('.inapp-msg').length;
  const adSupported = !!detailsInfo.find('.ads-supported-label-msg').length;

  const additionalInfo = $('.details-section-contents');
  const description = additionalInfo.find('div[itemprop=description] div');
  const version = additionalInfo.find('div.content[itemprop="softwareVersion"]').text().trim();
  const updated = additionalInfo.find('div.content[itemprop="datePublished"]').text().trim();
  const requiredAndroidVersion = additionalInfo.find('div.content[itemprop="operatingSystems"]').text().trim();
  const contentRating = additionalInfo.find('div.content[itemprop="contentRating"]').text().trim();
  const size = additionalInfo.find('div.content[itemprop="fileSize"]').text().trim();
  const installs = additionalInfo.find('div.content[itemprop="numDownloads"]').text().trim();
  const minInstalls = cleanInt(installs.split(' - ')[0]);
  const maxInstalls = cleanInt(installs.split(' - ')[1]) || undefined;

  let developerEmail = additionalInfo.find('.dev-link[href^="mailto:"]').attr('href');
  if (developerEmail) {
    developerEmail = developerEmail.split(':')[1];
  }

  let developerWebsite = additionalInfo.find('.dev-link[href^="http"]').attr('href');
  if (developerWebsite) {
    // extract clean url wrapped in google url
    developerWebsite = url.parse(developerWebsite, true).query.q;
  }

  const comments = [];
  $('.quoted-review').each(function (i) {
    comments[i] = $(this).text().trim();
  });
  const ratingBox = $('.rating-box');
  const reviews = cleanInt(ratingBox.find('span.reviews-num').text());

  const ratingHistogram = $('.rating-histogram');
  const histogram = {
    5: cleanInt(ratingHistogram.find('.five .bar-number').text()),
    4: cleanInt(ratingHistogram.find('.four .bar-number').text()),
    3: cleanInt(ratingHistogram.find('.three .bar-number').text()),
    2: cleanInt(ratingHistogram.find('.two .bar-number').text()),
    1: cleanInt(ratingHistogram.find('.one .bar-number').text())
  };
  // for other languages
  const score = parseFloat(ratingBox.find('div.score').text().replace(',', '.')) || 0;

  let video = $('.screenshots span.preview-overlay-container[data-video-url]').attr('data-video-url');
  if (video) {
    video = video.split('?')[0];
  }

  const screenshots = [];
  $('.thumbnails .screenshot').each(function (i, elem) {
    screenshots[i] = $(elem).attr('src');
  });

  return {
    title: title,
    icon: icon,
    minInstalls: minInstalls,
    maxInstalls: maxInstalls,
    offersIAP: offersIAP,
    adSupported: adSupported,
    score: score,
    reviews: reviews,
    histogram: histogram,
    description: descriptionText(description),
    descriptionHTML: description.html(),
    developer: developer,
    updated: updated,
    version: version,
    size: size,
    requiredAndroidVersion: requiredAndroidVersion,
    contentRating: contentRating,
    genre: genreText,
    genreId: genreId,
    familyGenre: familyGenreText,
    familyGenreId: familyGenreId,
    price: price,
    free: price === '0',
    developerEmail: developerEmail,
    developerWebsite: developerWebsite,
    video: video,
    comments: comments,
    screenshots: screenshots
  };
}

function descriptionText (description) {
  // preserve the line breaks when converting to text
  const html = '<div>' + description.html().replace(/<\/p>/g, '\n</p>') + '</div>';
  return cheerio.load(html)('div').text();
}

function cleanInt (number) {
  number = number || '0';
  // removes thousands separator
  number = number.replace(/\D/g, '');
  return parseInt(number);
}

module.exports = app;
