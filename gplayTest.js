import gplay from './index.js';
const functionsToRun = [
  gplay.app({ appId: 'com.mojang.minecraftpe' }).then(console.log, console.log),
  gplay.developer({ devId: 'Mojang' }).then(console.log, console.log),
  gplay.search({ term: 'puzzle', num: 2 }).then(console.log, console.log),
  gplay.list({ category: gplay.category.GAME_ACTION, collection: gplay.collection.TOP_FREE, num: 2 }).then(console.log, console.log),
  gplay.similar({ appId: 'com.mojang.minecraftpe' }).then(console.log, console.log),
  gplay.permissions({ appId: 'com.mojang.minecraftpe' }).then(console.log, console.log),
  gplay.reviews({ appId: 'com.mojang.minecraftpe', sort: gplay.sort.NEWEST, num: 2 }).then(console.log, console.log),
  gplay.suggest({ term: 'puzzle' }).then(console.log, console.log),
  gplay.categories().then(console.log, console.log),
  gplay.collection({ category: gplay.category.GAME_ACTION }).then(console.log, console.log),
];
// create a function that will run each of the below functions, and log the results, wait 2 seconds then run the next function, until all are complete
const runFunctions = async () => {
  for (const func of functionsToRun) {
    await func;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};
runFunctions();
