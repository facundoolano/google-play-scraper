'use strict';

const { CLUSTER_BASE_URL } = require('./utils/configurations');

const clusters = {
  new: 'new',
  top: 'top'
};

const collectionPaths = {
  TOP_FREE: { collection: 'topselling_free', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  TOP_PAID: { collection: 'topselling_paid', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  GROSSING: { collection: 'topgrossing', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  TRENDING: { collection: 'movers_shakers', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  TOP_FREE_GAMES: { collection: 'topselling_free_games', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  TOP_PAID_GAMES: { collection: 'topselling_paid_games', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  TOP_GROSSING_GAMES: { collection: 'topselling_grossing_games', path: `${CLUSTER_BASE_URL}/${clusters.top}` },
  NEW_FREE: { collection: 'topselling_new_free', path: `${CLUSTER_BASE_URL}/${clusters.new}` },
  NEW_PAID: { collection: 'topselling_new_paid', path: `${CLUSTER_BASE_URL}/${clusters.new}` },
  NEW_FREE_GAMES: { collection: 'topselling_new_free_games', path: `${CLUSTER_BASE_URL}/${clusters.new}` },
  NEW_PAID_GAMES: { collection: 'topselling_new_paid_games', path: `${CLUSTER_BASE_URL}/${clusters.new}` }
};

module.exports.clusters = clusters;

module.exports.paths = Object.keys(collectionPaths)
  .reduce((accumulator, next) => {
    const { collection, path } = collectionPaths[next];

    accumulator[collection] = path;
    return accumulator;
  }, {});

module.exports.category = {
  APPLICATION: 'APPLICATION',
  ANDROID_WEAR: 'ANDROID_WEAR',
  ART_AND_DESIGN: 'ART_AND_DESIGN',
  AUTO_AND_VEHICLES: 'AUTO_AND_VEHICLES',
  BEAUTY: 'BEAUTY',
  BOOKS_AND_REFERENCE: 'BOOKS_AND_REFERENCE',
  BUSINESS: 'BUSINESS',
  COMICS: 'COMICS',
  COMMUNICATION: 'COMMUNICATION',
  DATING: 'DATING',
  EDUCATION: 'EDUCATION',
  ENTERTAINMENT: 'ENTERTAINMENT',
  EVENTS: 'EVENTS',
  FINANCE: 'FINANCE',
  FOOD_AND_DRINK: 'FOOD_AND_DRINK',
  HEALTH_AND_FITNESS: 'HEALTH_AND_FITNESS',
  HOUSE_AND_HOME: 'HOUSE_AND_HOME',
  LIBRARIES_AND_DEMO: 'LIBRARIES_AND_DEMO',
  LIFESTYLE: 'LIFESTYLE',
  MAPS_AND_NAVIGATION: 'MAPS_AND_NAVIGATION',
  MEDICAL: 'MEDICAL',
  MUSIC_AND_AUDIO: 'MUSIC_AND_AUDIO',
  NEWS_AND_MAGAZINES: 'NEWS_AND_MAGAZINES',
  PARENTING: 'PARENTING',
  PERSONALIZATION: 'PERSONALIZATION',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  PRODUCTIVITY: 'PRODUCTIVITY',
  SHOPPING: 'SHOPPING',
  SOCIAL: 'SOCIAL',
  SPORTS: 'SPORTS',
  TOOLS: 'TOOLS',
  TRAVEL_AND_LOCAL: 'TRAVEL_AND_LOCAL',
  VIDEO_PLAYERS: 'VIDEO_PLAYERS',
  WEATHER: 'WEATHER',
  GAME: 'GAME',
  GAME_ACTION: 'GAME_ACTION',
  GAME_ADVENTURE: 'GAME_ADVENTURE',
  GAME_ARCADE: 'GAME_ARCADE',
  GAME_BOARD: 'GAME_BOARD',
  GAME_CARD: 'GAME_CARD',
  GAME_CASINO: 'GAME_CASINO',
  GAME_CASUAL: 'GAME_CASUAL',
  GAME_EDUCATIONAL: 'GAME_EDUCATIONAL',
  GAME_MUSIC: 'GAME_MUSIC',
  GAME_PUZZLE: 'GAME_PUZZLE',
  GAME_RACING: 'GAME_RACING',
  GAME_ROLE_PLAYING: 'GAME_ROLE_PLAYING',
  GAME_SIMULATION: 'GAME_SIMULATION',
  GAME_SPORTS: 'GAME_SPORTS',
  GAME_STRATEGY: 'GAME_STRATEGY',
  GAME_TRIVIA: 'GAME_TRIVIA',
  GAME_WORD: 'GAME_WORD',
  FAMILY: 'FAMILY',
  FAMILY_ACTION: 'FAMILY_ACTION',
  FAMILY_BRAINGAMES: 'FAMILY_BRAINGAMES',
  FAMILY_CREATE: 'FAMILY_CREATE',
  FAMILY_EDUCATION: 'FAMILY_EDUCATION',
  FAMILY_MUSICVIDEO: 'FAMILY_MUSICVIDEO',
  FAMILY_PRETEND: 'FAMILY_PRETEND'
};

module.exports.collection = Object.keys(collectionPaths)
  .reduce((accumulator, next) => {
    accumulator[next] = collectionPaths[next].collection;
    return accumulator;
  }, {});

module.exports.sort = {
  NEWEST: 2,
  RATING: 3,
  HELPFULNESS: 1
};

module.exports.age = {
  FIVE_UNDER: 'AGE_RANGE1',
  SIX_EIGHT: 'AGE_RANGE2',
  NINE_UP: 'AGE_RANGE3'
};
