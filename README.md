# google-play-scraper [![Build Status](https://secure.travis-ci.org/facundoolano/google-play-scraper.png)](http://travis-ci.org/facundoolano/google-play-scraper)
Node.js module to scrape application data from the Google Play store.

### Related projects

* [app-store-scraper](https://github.com/facundoolano/app-store-scraper): a scraper with a similar interface for the iTunes app store.
* [aso](https://github.com/facundoolano/aso): an App Store Optimization module built on top of this library.
* [google-play-api](https://github.com/facundoolano/google-play-api): a RESTful API to consume the data produced by this library.

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
- [permissions](#permissions): Returns the list of permissions an app has access to.

### app

Retrieves the full detail of an application. Options:

* `appId`: the Google Play id of the application (the `?id=` parameter on the url).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app page.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.app({appId: 'com.dxco.pandavszombies'})
  .then(console.log, console.log);
```
Results:

```javascript
{
  appId: 'com.dxco.pandavszombies',
  title: 'Panda vs Zombie: Elvis rage',
  summary: 'Help Rocky the Panda warrior to fight zombie games and save the Panda kind.',
  url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=en',
  icon: 'https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w300',
  minInstalls: 10000,
  maxInstalls: 50000,
  score: 4.9,
  reviews: 2312,
  histogram: { '1': 12, '2': 7, '3': 16, '4': 40, '5': 231 },
  description: 'Everyone in town has gone zombie.',
  developerId: "DxCo+Games",
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
  androidVersionText: '2.3 and up',
  androidVersion: '2.3',
  contentRating: 'Mature 17+',
  price: '0',
  free: true,
  screenshots: ['https://lh3.ggpht.com/le0bhlp7RTGDytoXelnY65Cx4pjUgVjnLypDGGWGfF6SbDMTkU6fPncaAH8Ew9RQAeY=h310']
  video: 'https://www.youtube.com/embed/PFGj-W8Pe5s',
  comments: ['Great! Its a great time waster'],
  recentChanges: [ '- Added a hint system' ],
  preregister: false
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
  .then(console.log, console.log);
```
Results:

```javascript
 [ { url: 'https://play.google.com/store/apps/details?id=com.playappking.busrush',
    appId: 'com.playappking.busrush',
    summary: 'Bus Rush is an amazing running game for Android! Start running now!',
    developer: 'Play App King',
    developerId: '6375024885749937863',
    title: 'Bus Rush',
    icon: 'https://lh3.googleusercontent.com/R6hmyJ6ls6wskk5hHFoW02yEyJpSG36il4JBkVf-Aojb1q4ZJ9nrGsx6lwsRtnTqfA=w340',
    score: 3.9,
    price: '0',
    free: false },
  { url: 'https://play.google.com/store/apps/details?id=com.yodo1.crossyroad',
    appId: 'com.yodo1.crossyroad',
    title: 'Crossy Road',
    summary: 'Embark on an action arcade, endless runner journey!',
    developer: 'Yodo1 Games',
    developerId: 'Yodo1+Games',
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
    summary: 'An exciting action adventure RPG of Panda proportions!',
    title: 'Taichi Panda',
    developer: 'Snail Games USA',
    developerId: 'Snail+Games+USA+Inc',
    icon: 'https://lh3.googleusercontent.com/g8RMjpRk9yetsui4g5lxnioAFwtgoKUJDBnb2knJMrOaLOtHrwU1qYkb-PadbL0Zmg=w340',
    score: 4.1,
    price: '0',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp',
    appId: 'com.sgn.pandapop.gp',
    summary: 'Plan your every pop to rescue baby pandas from the evil Baboon!',
    title: 'Panda Pop',
    developer: 'SGN',
    developerId: '5509190841173705883',
    icon: 'https://lh5.ggpht.com/uAAUBzEHtD_-mTxomL2wFxb5VSdtNllk9M4wjVdTGMD8pH79RtWGYQYrrtfVTjq7PV7M=w340',
    score: 4.2,
    price: '0',
    free: true } ]
```

### developer
Returns the list of applications by the given developer name. Options:

* `devId`: the name of the developer.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.
* `num` (optional, defaults to 20): the amount of apps to retrieve.
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
    summary: 'Help Rocky the Panda warrior to fight zombies again!',
    developer: 'DxCo Games',
    developerId: 'DxCo+Games',
    icon: 'https://lh3.googleusercontent.com/kFco0LtC7ICP0QrtpkF-QQahU-iwuDgEsH0AClQcHwtzsO5-8BGTf8QgR6dlCLxqBLc=w340',
    score: 3.9,
    price: '0',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies',
    appId: 'com.dxco.pandavszombies',
    title: 'Panda vs Zombie: panda ftw',
    summary: 'Help Rocky the Panda warrior to fight zombie games and save the Panda kind.',
    developer: 'DxCo Games',
    developerId: 'DxCo+Games',
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

gplay.suggest({term: 'panda'}).then(console.log);
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
Retrieves a page of reviews for a specific application.

Note that this method returns reviews in a specific language (english by default), so you need to try different languages to get more reviews. Also, the counter displayed in the Google Play page refers to the total number of 1-5 stars ratings the application has, not the written reviews count. So if the app has 100k ratings, don't expect to get 100k reviews by using this method.

Options:

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
}).then(console.log, console.log);
```

Results:

```javascript
[ { id: 'gp:AOqpTOFmAVORqfWGcaqfF39ftwFjGkjecjvjXnC3g_uL0NtVGlrrqm8X2XUWx0WydH3C9afZlPUizYVZAfARLuk',
    userName: 'Inga El-Ansary',
    userImage: 'https://lh3.googleusercontent.com/-hBGvzn3XlhQ/AAAAAAAAAAI/AAAAAAAAOw0/L4GY9KrQ-DU/w96-c-h96/photo.jpg',
    date: 'June 7, 2015',
    score: 5,
    url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&reviewId=Z3A6QU9xcFRPRWZaVHVZZ081NlNsRW9TV0hJeklGSTBvYTBTUlFQUUJIZThBSGJDX2s1Y1o0ZXRCbUtLZmgzTE1PMUttRmpRSS1YcFgxRmx1ZXNtVzlVS0Zz'
    title: 'I LOVE IT',
    text: 'It has skins and snowballs everything I wanted its so cool I love it!!!!!!!!',
    replyDate: 'June 9, 2015',
    replyText: 'thanks for playing Panda vs Zombies!' },
{   id: 'gp:AOqpTOF39mpW-6gurlkCCTV_8qnKne7O5wcFsLc6iGVot5hHpplqPCqIiVL2fjximXNujuMjwQ4pkizxGrn13x0',
    userName: 'Millie Hawthorne',
    userImage: 'https://lh5.googleusercontent.com/-Q_FTAEBH2Qg/AAAAAAAAAAI/AAAAAAAAAZk/W5dTdaHCUE4/w96-c-h96/photo.jpg',
    date: 'January 24, 2015',
    url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&reviewId=Z3A6QU9xcFRPRmFHdlBFS2pGS2JVYW5Dd3kxTm1qUzRxQlYyc3Z4ZE9CYXRuc0hkclV3a09hbEFkOVdoWmw3eFN5VjF4cDJPLTg5TW5ZUjl1Zm9HOWc5NGtr',
    score: 5,
    title: 'CAN NEVER WAIT TILL NEW UPDATE',
    text: 'Love it but needs to pay more attention to pocket edition',
    replyDate: undefined,
    replyText: undefined } ]
```

### similar
Returns a list of similar apps to the one specified. Options:

* `appId`: the Google Play id of the application to get similar apps for.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.similar({appId: "com.dxco.pandavszombies"}).then(console.log);
```

Results:
```javascript
[ { url: 'https://play.google.com/store/apps/details?id=com.creative.rambo',
    appId: 'com.creative.rambo',
    summary: 'Rambo - The Mobile Game',
    developer: 'Creative Distribution Ltd',
    developerId: '8812103738509382093',
    icon: '//lh3.googleusercontent.com/QDRAv7v4LSCfZgz3GIbOSz8Zj8rWqeeYuqqYiqyQXkxRJwG7vvUltzsFaWK5D7-JMnIZ=w340',
    score: 3.3,
    price: '$2.16',
    free: false } ]
```

### permissions
Returns the list of permissions an app has access to.

* `appId`: the Google Play id of the application to get permissions for.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the permissions.
* `short` (optional, defaults to `false`): if `true`, the permission names will be returned instead of
permission/description objects.

Example:

```javascript
var gplay = require('google-play-scraper');

gplay.permissions({appId: "com.dxco.pandavszombies"}).then(console.log);
```

Results:
```javascript
[ { permission: 'modify or delete the contents of your USB storage',
    description: 'Allows the app to write to the USB storage.' },
  { permission: 'read the contents of your USB storage',
    description: 'Allows the app to read the contents of your USB storage.' },
  { permission: 'full network access',
    description: 'Allows the app to create network sockets and use custom network protocols. The browser and other applications provide means to send data to the internet, so this permission is not required to send data to the internet.' },
  { permission: 'view network connections',
    description: 'Allows the app to view information about network connections such as which networks exist and are connected.' } ]
```

## Memoization

Starting with version `1.2.2` all methods are [memoized](https://github.com/medikoo/memoizee) by default, which means
the results are cached so the request and response processing is skipped if
a function is called again with the same arguments.
The cached values are set to expire every 12 hours, which should work fine in most
cases since Google Play usually refreshes the data once per day.

In case you want to force fresh results or want to avoid the cache memory consumption altogether,
you can pass `cache: false` to any of the methods:

```js
var gplay = require('google-play-scraper');

// first call will hit google play and cache the results
gplay.developer({devId: "DxCo Games"}).then(console.log);

// second call will return cached results
gplay.developer({devId: "DxCo Games"}).then(console.log);

// force fresh results (don't memoize)
gplay.developer({devId: "DxCo Games", cache: false}).then(console.log);
```

If you are interested in seeing how may requests are being done, you can run
your node program with `DEBUG=google-play-scraper`.

## Throttling

All methods on the scraper have to access the Google Play server in one
form or another. When making too many requests in a short period of time
(specially when using the `fullDetail` option), is common to hit Google Play's
throttling limit. That means requests start getting status 503 responses with
a captcha to verify if the requesting entity is a human (which is not :P).
In those cases the requesting IP can be banned from making further requests for a
while (usually around an hour).

To avoid this situation, all methods now support a `throttle` property, which
defines an upper bound to the amount of requests that will be attempted per second.
Once that limit is reached, further requests will be held until the second passes.

```js
var gplay = require('google-play-scraper');

// the following method will perform batches of 10 requests per second
gplay.search({term: 'panda', throttle: 10}).then(console.log);
```

By default, no throttling is applied.
