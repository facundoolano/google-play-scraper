const c = require('../constants');

function isNewCollection (collection) {
  const newCollections = [
    c.collection.NEW_FREE,
    c.collection.NEW_PAID,
    c.collection.NEW_FREE_GAMES,
    c.collection.NEW_PAID_GAMES
  ];

  return newCollections.includes(collection);
}

module.exports = {
  isNewCollection
};
