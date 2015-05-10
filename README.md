# google-play-scraper
Scrapes basic application data from the Google Play store.

## Installation
```
npm install google-play-scraper
```

## Usage
### app(appId, lang)

Retrieves the full detail of an application. Parameters:

* `appId`: the Google Play id of the application (the `?id=` parameter on the url).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app page.

Example:

```javascript
var gplay = require('google-play-scrapper');

gplay.app('com.dxco.pandavszombies')
  .then(function(app){
    console.log('Retrieved application: ' + app.title);
  })
  .catch(function(e){
    console.log('There was an error fetching the application!');
  });
```
Results:

```javascript
{
  appId: 'com.dxco.pandavszombies',
  title: 'Panda vs Zombie: Elvis rage',
  url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=en',
  icon: 'https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w300',
  minInstalls: 10000,
  maxInstalls: 50000,
  score: 4.9,
  reviews: 2312,
  description: 'Everyone in town has gone zombie.',
  descriptionHTML: 'Everyone in town has gone <b>zombie</b>.',
  developer: 'DxCo Games',
  genre: 'Action',
  price: '0',
  free: true,
  video: 'https://www.youtube.com/embed/PFGj-W8Pe5s'
}
```

### list(opts)
Retrieve a list of applications from one of the collections at Google Play. Options:

* `collection` (optional, defaults to `collection.TOP_FREE`): the Google Play collection that will be retrieved. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L49).
* `category` (optional, deafaults to no category): the app category to filter by. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L2).
* `num` (optional, defaults to 60, max is 120): the amount of apps to retrieve.
* `start` (optional, defaults to 0, max is 500): the starting index of the retrieved list.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.

Example:

```javascript
var gplay = require('google-play-scrapper');

gplay.list({
    category: gplay.category.GAME_ACTION,
    collection: gplay.collection.TOP_FREE,
    num: 2
  })
  .then(function(apps){
    console.log('Retrieved', apps.length  'applications!');
  })
  .catch(function(e){
    console.log('There was an error fetching the list!');
  });
```
Results:

```javascript
 [ { url: 'https://play.google.com/store/apps/details?id=com.playappking.busrush',
    appId: 'com.playappking.busrush',
    title: 'Bus Rush',
    developer: 'Play App King',
    icon: 'https://lh3.googleusercontent.com/R6hmyJ6ls6wskk5hHFoW02yEyJpSG36il4JBkVf-Aojb1q4ZJ9nrGsx6lwsRtnTqfA=w340',
    score: 3.9,
    price: '0',
    free: false },
  { url: 'https://play.google.com/store/apps/details?id=com.yodo1.crossyroad',
    appId: 'com.yodo1.crossyroad',
    title: 'Crossy Road',
    developer: 'Yodo1 Games',
    icon: 'https://lh3.googleusercontent.com/doHqbSPNekdR694M-4rAu9P2B3V6ivff76fqItheZGJiN4NBw6TrxhIxCEpqgO3jKVg=w340',
    score: 4.5,
    price: '0',
    free: false } ]
```

### search(opts)
Retrieves a list of apps that results of searching by the given term. Options:

* `term`: the term to search by.
* `num` (optional, defaults to 20, max is 250): the amount of apps to retrieve.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.

Example:

```javascript
var gplay = require('google-play-scrapper');

gplay.search({
    term: "panda",
    num: 2
  }).then(console.log, console.log);
```
Results:

```javascript
[ { url: 'https://play.google.com/store/apps/details?id=com.snailgameusa.tp',
    appId: 'com.snailgameusa.tp',
    title: 'Taichi Panda',
    developer: 'Snail Games USA',
    icon: 'https://lh3.googleusercontent.com/g8RMjpRk9yetsui4g5lxnioAFwtgoKUJDBnb2knJMrOaLOtHrwU1qYkb-PadbL0Zmg=w340',
    score: 4.1,
    price: '0',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp',
    appId: 'com.sgn.pandapop.gp',
    title: 'Panda Pop',
    developer: 'SGN',
    icon: 'https://lh5.ggpht.com/uAAUBzEHtD_-mTxomL2wFxb5VSdtNllk9M4wjVdTGMD8pH79RtWGYQYrrtfVTjq7PV7M=w340',
    score: 4.2,
    price: '0',
    free: true } ]
```

### developer(devId, lang)
Returns the list of applications by the given developer name. Parameters:

* `devId`: the name of the developer.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.

Example:

```javascript
var gplay = require('google-play-scrapper');

gplay.developer("DxCo Games").then(console.log);
```

Results:
```javascript
[ { url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies',
    appId: 'com.dxco.pandavszombies',
    title: 'Panda vs Zombie: Elvis rage',
    developer: 'DxCo Games',
    icon: 'https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w340',
    score: 4.7,
    price: '0',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.dxco',
    appId: 'com.dxco',
    title: 'Pirate Run: Queer Buccaneer',
    developer: 'DxCo Games',
    icon: 'https://lh3.ggpht.com/biLJnt699Gce5U8nLb91T9w2sQ2deUL3Ealn5MI3fbyohIFjccd7E6d9fPzoVwbyc_Q=w340',
    score: 4.6,
    price: '0',
    free: true } ]
```

### suggest(term)
Given a string returns up to five suggestion to complete a search query term.

Example:
```javascript
var gplay = require('google-play-scrapper');

gplay.suggest("panda").then(console.log);
```

Results:
```javascript
[ 'panda pop',
  'panda',
  'panda games',
  'panda run',
  'panda pop for free' ]
```
