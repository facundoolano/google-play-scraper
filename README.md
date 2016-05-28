# google-play-scraper [![Build Status](https://secure.travis-ci.org/facundoolano/google-play-scraper.png)](http://travis-ci.org/facundoolano/google-play-scraper)
Node.js module to scrape application data from the Google Play store. 

See [google-play-api](https://github.com/facundoolano/google-play-api) for a RESTful API to consume the data produced by this library.

## Installation
```
npm install google-play-scraper
```

## Usage
Available methods:
- [app](#app): Retrieves the full detail of an application.
- [list](#list): Retrieves a list of applications from one of the collections at Google Play.
- [search](#search): Retrieves a list of apps that results of searching by the given term.
- [developer](#developer): Returns the list of applications by the given developer name.
- [suggest](#suggest): Given a string returns up to five suggestion to complete a search query term.
- [reviews](#reviews): Retrieves a page of reviews for a specific application.
- [similar](#similar): Returns a list of similar apps to the one specified.

### app

Retrieves the full detail of an application. Options:

* `appId`: the Google Play id of the application (the `?id=` parameter on the url).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app page.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.app({appId: 'com.dxco.pandavszombies'})
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
  histogram: { '1': 12, '2': 7, '3': 16, '4': 40, '5': 231 },
  description: 'Everyone in town has gone zombie.',
  descriptionHTML: 'Everyone in town has gone <b>zombie</b>.',
  developer: 'DxCo Games',
  developerEmail: 'dxcogames@gmail.com',
  developerWebsite: 'http://www.dxco-games.com/',
  updated: 'May 26, 2015',
  genre: 'Action',
  genreId: 'GAME_ACTION',
  familyGenre: undefined,
  familyGenreId: undefined,
  version: '1.4',
  size: '34M',
  requiredAndroidVersion: '2.3 and up',
  contentRating: 'Mature 17+',
  price: '0',
  free: true,
  screenshots: ['https://lh3.ggpht.com/le0bhlp7RTGDytoXelnY65Cx4pjUgVjnLypDGGWGfF6SbDMTkU6fPncaAH8Ew9RQAeY=h310']
  video: 'https://www.youtube.com/embed/PFGj-W8Pe5s',
  comments: ['Great! Its a great time waster']
}
```

### list
Retrieve a list of applications from one of the collections at Google Play. Options:

* `collection` (optional, defaults to `collection.TOP_FREE`): the Google Play collection that will be retrieved. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L58).
* `category` (optional, deafaults to no category): the app category to filter by. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L3).
* `age` (optional, defaults to no age filter): the age range to filter the apps (only for FAMILY and its subcategories). Available options are `age.FIVE_UNDER`, `age.SIX_EIGHT`, `age.NINE_UP`.
* `num` (optional, defaults to 60, max is 120): the amount of apps to retrieve.
* `start` (optional, defaults to 0, max is 500): the starting index of the retrieved list.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.list({
    category: gplay.category.GAME_ACTION,
    collection: gplay.collection.TOP_FREE,
    num: 2
  })
  .then(function(apps){
    console.log('Retrieved ' + apps.length + ' applications!');
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

### search
Retrieves a list of apps that results of searching by the given term. Options:

* `term`: the term to search by.
* `num` (optional, defaults to 20, max is 250): the amount of apps to retrieve.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.
* `price` (optional, defaults to `all`): allows to control if the results apps are free, paid or both.
    * `all`: Free and paid
    * `free`: Free apps only
    * `paid`: Paid apps only


Example:

```javascript
var gplay = require('google-play-scraper');

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

### developer
Returns the list of applications by the given developer name. Options:

* `devId`: the name of the developer.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.
* `num` (optional, defaults to 20, max is 250): the amount of apps to retrieve.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.developer({devId: "DxCo Games"}).then(console.log);
```

Results:
```javascript
[ { url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies2',
    appId: 'com.dxco.pandavszombies2',
    title: 'Panda vs Zombie 2 Panda\'s back',
    developer: 'DxCo Games',
    icon: 'https://lh3.googleusercontent.com/kFco0LtC7ICP0QrtpkF-QQahU-iwuDgEsH0AClQcHwtzsO5-8BGTf8QgR6dlCLxqBLc=w340',
    score: 3.9,
    price: '0',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies',
    appId: 'com.dxco.pandavszombies',
    title: 'Panda vs Zombie: panda ftw',
    developer: 'DxCo Games',
    icon: 'https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w340',
    score: 4.5,
    price: '0',
    free: true } ]
```

### suggest
Given a string returns up to five suggestion to complete a search query term.

Example:
```javascript
var gplay = require('google-play-scraper');

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
### reviews
Retrieves a page of reviews for a specific application. Options:

* `appId`: Unique application id for Google Play. (e.g. id=com.mojang.minecraftpe maps to Minecraft: Pocket Edition game).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the reviews.
* `sort` (optional, defaults to `sort.NEWEST`): The way the reviews are going to be sorted. Accepted values are: `sort.NEWEST`, `sort.RATING` and `sort.HELPFULNESS`.
* `page` (optional, defaults to 0): Number of page that contains reviews. Every page has 40 reviews at most.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.reviews({
  appId: 'com.mojang.minecraftpe',
  page: 0,
  sort: gplay.sort.RATING
}).then(function(apps){
  console.log('Retrieved ' + apps.length + ' reviews!');
}).catch(function(e){
  console.log('There was an error fetching the reviews!');
});
```

Results:

```javascript
{ userId: '105245098829984360718',
    userName: 'Inga El-Ansary',
    date: 'June 7, 2015',
    score: 5,
    title: 'I LOVE IT',
    text: 'It has skins and snowballs everything I wanted its so cool I love it!!!!!!!!',
    replyDate: 'June 9, 2015',
    replyText: 'thanks for playing Panda vs Zombies!' },
  { userId: '113710523919870296648',
    userName: 'Millie Hawthorne',
    date: 'January 24, 2015',
    score: 5,
    title: 'CAN NEVER WAIT TILL NEW UPDATE',
    text: 'Love it but needs to pay more attention to pocket edition',
    replyDate: undefined,
    replyText: undefined } }]
```

### similar
Returns a list of similar apps to the one specified. Options:

* `appId`: the Google Play id of the application to get similar apps for.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.developer({appId: "com.dxco.pandavszombies"}).then(console.log);
```

Results:
```javascript
[ { url: 'https://play.google.com/store/apps/details?id=com.creative.rambo',
    appId: 'com.creative.rambo',
    title: 'Rambo',
    developer: 'Creative Distribution Ltd',
    icon: '//lh3.googleusercontent.com/QDRAv7v4LSCfZgz3GIbOSz8Zj8rWqeeYuqqYiqyQXkxRJwG7vvUltzsFaWK5D7-JMnIZ=w340',
    score: 3.3,
    price: '$2.16',
    free: false } ]
```
