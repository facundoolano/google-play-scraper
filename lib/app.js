'use strict';

const request = require('./utils/request');
const cheerio = require('cheerio');
const queryString = require('querystring');
const url = require('url');
const R = require('ramda');

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

    const options = Object.assign({
      url: reqUrl,
      followAllRedirects: true
    }, opts.requestOptions);

    request(options, opts.throttle)
      .then(cheerio.load)
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
  const title = detailsInfo.find('.document-title').text().trim();
  const developer = detailsInfo.find('span[itemprop="name"]').text();
  const developerId = detailsInfo.find('.primary').attr('href').split('id=')[1];
  const summary = $('meta[name="description"]').attr('content');

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
  const androidVersionText = additionalInfo.find('div.content[itemprop="operatingSystems"]').text().trim();
  const androidVersion = normalizeAndroidVersion(androidVersionText);
  const contentRating = additionalInfo.find('div.content[itemprop="contentRating"]').text().trim();
  const size = additionalInfo.find('div.content[itemprop="fileSize"]').text().trim();

  let maxInstalls, minInstalls;
  const preregister = !!$('.preregistration-container').length;
  if (!preregister) {
    const installs = installNumbers(additionalInfo.find('div.content[itemprop="numDownloads"]').text().trim());
    minInstalls = cleanInt(installs[0]);
    maxInstalls = cleanInt(installs[1]);
  }

  let developerEmail = additionalInfo.find('.dev-link[href^="mailto:"]').attr('href');
  if (developerEmail) {
    developerEmail = developerEmail.split(':')[1];
  }

  let developerWebsite = additionalInfo.find('.dev-link[href^="http"]').attr('href');
  if (developerWebsite) {
    // extract clean url wrapped in google url
    developerWebsite = url.parse(developerWebsite, true).query.q;
  }

  const developerAddress = additionalInfo.find('.physical-address').text().trim();

  const comments = $('.quoted-review').toArray().map((elem) => $(elem).text().trim());
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

  const screenshots = $('.thumbnails .screenshot').toArray().map((elem) => $(elem).attr('src'));
  const recentChanges = $('.recent-change').toArray().map((elem) => $(elem).text());

  const fields = {
    title,
    summary,
    icon,
    price,
    free: price === '0',
    minInstalls,
    maxInstalls,
    score,
    reviews,
    developer,
    developerId,
    developerEmail,
    developerWebsite,
    developerAddress,
    updated,
    version,
    genre: genreText,
    genreId,
    familyGenre: familyGenreText,
    familyGenreId,
    size,
    description: descriptionText(description),
    descriptionHTML: description.html(),
    histogram,
    offersIAP,
    adSupported,
    androidVersionText,
    androidVersion,
    contentRating,
    screenshots,
    video,
    comments,
    recentChanges,
    preregister
  };

  // replace blank values with undefined
  return R.map((field) => field === '' ? undefined : field, fields);
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

function installNumbers (downloads) {
  if (!downloads) {
    return [0, 0];
  }

  const characters = [' - ', ' et ', '–', '-', '～', ' a '];
  const char = characters.find((char) => downloads.split(char).length === 2);
  if (char) return downloads.split(char);

  throw new Error(`Unable to parse min/max downloads: ${downloads}`);
}

function normalizeAndroidVersion (androidVersionText) {
  let matches = androidVersionText.match(/^([0-9\.]+)[^0-9\.].+/);

  if (!matches || typeof matches[1] === 'undefined') {
    return 'VARY';
  }

  return matches[1];
}

module.exports = app;
