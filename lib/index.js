'use strict';

const Express = require('express');
const gplay = require('google-play-scraper');
const path = require('path');
const qs = require('querystring');

const router = Express.Router();

const toList = (apps) => ({results: apps});

const cleanUrls = (req) => (app) => Object.assign({}, app, {
  playstoreUrl: app.url,
  url: buildUrl(req, 'apps/' + app.appId),
  permissions: buildUrl(req, 'apps/' + app.appId + '/permissions'),
  similar: buildUrl(req, 'apps/' + app.appId + '/similar'),
  reviews: buildUrl(req, 'apps/' + app.appId + '/reviews'),
  developer: {
    devId: app.developer,
    url: buildUrl(req, 'developers/' + qs.escape(app.developer))
  }
});

const buildUrl = (req, subpath) =>
  req.protocol + '://' + path.join(req.get('host'), req.baseUrl, subpath);

/* Index */
router.get('/', (req, res) =>
  res.json({
    apps: buildUrl(req, 'apps'),
    developers: buildUrl(req, 'developers')
  }));

/* App search */
router.get('/apps/', function (req, res, next) {
  if (!req.query.q) {
    return next();
  }

  const opts = Object.assign({term: req.query.q}, req.query);

  gplay.search(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* Search suggest */
router.get('/apps/', function (req, res, next) {
  if (!req.query.suggest) {
    return next();
  }

  const toJSON = (term) => ({
    term,
    url: buildUrl(req, '/apps/') + '?' + qs.stringify({q: term})
  });

  gplay.suggest({term: req.query.suggest})
    .then((terms) => terms.map(toJSON))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App list */
router.get('/apps/', function (req, res, next) {
  function paginate (apps) {
    const num = parseInt(req.query.num || '60');
    const start = parseInt(req.query.start || '0');

    if (start - num >= 0) {
      req.query.start = start - num;
      apps.prev = buildUrl(req, '/apps/') + '?' + qs.stringify(req.query);
    }

    if (start + num <= 500) {
      req.query.start = start + num;
      apps.next = buildUrl(req, '/apps/') + '?' + qs.stringify(req.query);
    }

    return apps;
  }

  gplay.list(req.query)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList).then(paginate)
    .then(res.json.bind(res))
    .catch(next);
});

/* App detail*/
router.get('/apps/:appId', function (req, res, next) {
  const opts = Object.assign({appId: req.params.appId}, req.query);
  gplay.app(opts)
    .then(cleanUrls(req))
    .then(res.json.bind(res))
    .catch(next);
});

/* Similar apps */
router.get('/apps/:appId/similar', function (req, res, next) {
  const opts = Object.assign({appId: req.params.appId}, req.query);
  gplay.similar(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App permissions */
router.get('/apps/:appId/permissions', function (req, res, next) {
  const opts = Object.assign({appId: req.params.appId}, req.query);
  gplay.permissions(opts)
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App reviews */
router.get('/apps/:appId/reviews/:sortType', function (req, res, next) {
  function paginate (apps) {
    const page = parseInt(req.query.page || '0');

    const subpath = '/apps/' + req.params.appId + '/reviews/';
    if (page > 0) {
      req.query.page = page - 1;
      apps.prev = buildUrl(req, subpath) + '?' + qs.stringify(req.query);
    }

    if (apps.results.length) {
      req.query.page = page + 1;
      apps.next = buildUrl(req, subpath) + '?' + qs.stringify(req.query);
    }

    return apps;
  }
  let sorty = 0;
  if (req.params.sortType === 'newest') {
    sorty = 0;
  }
  if (req.params.sortType === 'rating') {
    sorty = 1;
  }
  if (req.params.sortType === 'helpfulness') {
    sorty = 2;
  }
  const opts = Object.assign({appId: req.params.appId, sort: parseInt(sorty)}, req.query);
  gplay.reviews(opts)
    .then(toList)
    .then(paginate)
    .then(res.json.bind(res))
    .catch(next);
});

/* Apps by developer */
router.get('/developers/:devId/', function (req, res, next) {
  const opts = Object.assign({devId: req.params.devId}, req.query);

  gplay.developer(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then((apps) => ({
      devId: req.params.devId,
      apps
    }))
    .then(res.json.bind(res))
    .catch(next);
});

/* Developer list (not supported) */
router.get('/developers/', (req, res) =>
  res.status(400).json({
    message: 'Please specify a developer id.',
    example: buildUrl(req, '/developers/' + qs.escape('DxCo Games'))
  }));

function errorHandler (err, req, res, next) {
  res.status(400).json({message: err.message});
  next();
}

router.use(errorHandler);

module.exports = router;
