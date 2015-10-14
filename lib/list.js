var Promise = require('bluebird'),
    rp = require('request-promise'),
    cheerio = require('cheerio'),
    _ = require('lodash');

var c = require('./constants'),
    h = require('./helpers');

function list(opts) {
    initDefaultOptsValues(opts);        

    return new Promise(function (resolve, reject) {
        var errors = validate(opts);

        if (errors.length !== 0) {
            console.log('error on validate: '+errors[0].message);
          return reject(errors[0].message, null);
        }

        var url = buildUrl(opts);

        rp(url)
            .then(cheerio.load, h.requestError)
            .then(h.getParseList(opts))
            .then(resolve)
            .catch(reject);
    });
}

function buildUrl(opts) {
    var url = 'https://play.google.com/store/apps';

    if (opts.category) {
        url += '/category/' + opts.category;
    }

    url += '/collection/' + opts.collection;
    url += '?hl=' + opts.lang + '&gl=' + opts.country + '&start=' + opts.start + '&num=' + opts.num;

    return url;
}

function initDefaultOptsValues(opts){
    opts = opts || {};

    opts.collection = opts.collection || c.collection.TOP_FREE;
    opts.num = opts.num || 60;
    opts.start = opts.start || 0;
    opts.lang = opts.lang || 'en';
    opts.country = opts.country || 'us';
    opts.fullDetail = opts.fullDetail || false;
}

function validate(opts) {
    var schema = require('validate');
    var param = schema({
      collection: {
        type: 'string',
        use: function(value){
            return _.includes(value, opts.collection);
        },
        message: 'Invalid collection ' + opts.collection
      },        
      category: {
        type: 'string',
        use: function(value){
            return opts.category && _.includes(value, opts.category);            
        },
        message: 'Invalid category ' + opts.category
      },      
      num: {
        type: 'number',
        use: function(value){
            return value <= 120;
        },
        message: 'Cannot retrieve more than 120 apps at a time'
      },
      start: {
        type: 'number',
        use: function(value){
            return value <= 500;
        },
        message: 'The maximum starting index is 500'
      },
      lang: {
        type: 'string',
        message: "Invalid type for option 'lang'."        
      },
      country: {
        type: 'string',
        message: "Invalid type for option 'country'."        
      },
      fullDetail: {
        type: 'boolean',
        message: "Invalid type for option 'fullDetail'."        
      }
    });

    return param.validate(opts);
  }

module.exports = list;
