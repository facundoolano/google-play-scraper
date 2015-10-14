var Promise = require('bluebird'),
    request = require('request-promise'),
    cheerio = require('cheerio');

var h = require('./helpers');

function developer(devId, lang) {
    var query = {
        devId : encodeURIComponent(devId),
        lang: lang || 'en'
    };

    return new Promise(function (resolve, reject) {
        var errors = validate(query);

        if (errors.length !== 0) {
            console.log('error on validate: '+errors[0].message);
          return reject(errors[0].message, null);
        }

        request(buildUrl(query))
            .then(cheerio.load, h.requestError)
            .then(h.getParseList({})) //FIXME allow get full detail
            .then(resolve)
            .catch(reject);
    });
}

function buildUrl(query) {
    return 'https://play.google.com/store/apps/developer?id=' + query.devId + '&hl=' + query.lang;
}

function validate(query) {
    var schema = require('validate');
    var param = schema({
      devId: {
        type: 'string',
        required: true,
        message: "Parameter 'devId' is required."
      },
      lang: {
        type: 'string',
        message: "Invalid type for option 'lang'."        
      }
    });

    return param.validate(query);
  }

module.exports = developer;
