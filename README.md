# google-play-scraper [![workflow](https://github.com/facundoolano/google-play-scraper/actions/workflows/tests.yml/badge.svg)](https://github.com/facundoolano/google-play-scraper/actions/workflows/tests.yml)
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
- [datasafety](#datasafety): Returns the data safety information of an app.
- [categories](#categories): Retrieve a full list of categories present from dropdown menu on Google Play.

### app

Retrieves the full detail of an application. Options:

* `appId`: the Google Play id of the application (the `?id=` parameter on the url).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app page.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.

Example:

```javascript
import gplay from "google-play-scraper";

gplay.app({appId: 'com.google.android.apps.translate'})
  .then(console.log, console.log);
```
Results:

```javascript
{
  title: 'Google Translate',
  description: 'Translate between 103 languages by typing\r\n...' ,
  descriptionHTML: 'Translate between 103 languages by typing<br>...',
  summary: 'The world is closer than ever with over 100 languages',
  installs: '500,000,000+',
  minInstalls: 500000000,
  maxInstalls: 898626813,
  score: 4.482483,
  scoreText: '4.5',
  ratings: 6811669,
  reviews: 1614618,
  histogram: { '1': 370042, '2': 145558, '3': 375720, '4': 856865, '5': 5063481 },
  price: 0,
  free: true,
  currency: 'USD',
  priceText: 'Free',
  offersIAP: false,
  IAPRange: undefined,
  androidVersion: 'VARY',
  androidVersionText: 'Varies with device',
  androidMaxVersion: 'VARY',
  developer: 'Google LLC',
  developerId: '5700313618786177705',
  developerEmail: 'translate-android-support@google.com',
  developerWebsite: 'http://support.google.com/translate',
  developerAddress: '1600 Amphitheatre Parkway, Mountain View 94043',
  developerLegalName: undefined,
  developerLegalEmail: undefined,
  developerLegalAddress: undefined,
  developerLegalPhoneNumber: undefined,
  privacyPolicy: 'http://www.google.com/policies/privacy/',
  developerInternalID: '5700313618786177705',
  genre: 'Tools',
  genreId: 'TOOLS',
  categories: [
    { name: 'Tools', id: 'TOOLS' },
    { name: 'Another category without id', id: null }
  ],
  icon: 'https://lh3.googleusercontent.com/ZrNeuKthBirZN7rrXPN1JmUbaG8ICy3kZSHt-WgSnREsJzo2txzCzjIoChlevMIQEA',
  headerImage: 'https://lh3.googleusercontent.com/e4Sfy0cOmqpike76V6N6n-tDVbtbmt6MxbnbkKBZ_7hPHZRfsCeZhMBZK8eFDoDa1Vf-',
  screenshots: [
    'https://lh3.googleusercontent.com/dar060xShkqnJjWC2j_EazWBpLo28X4IUWCYXZgS2iXes7W99LkpnrvIak6vz88xFQ',
    'https://lh3.googleusercontent.com/VnzidUTSWK_yhpNK0uqTSfpVgow5CsZOnBdN3hIpTxODdlZg1VH1K4fEiCrdUQEZCV0',
  ],
  video: undefined,
  videoImage: undefined,
  previewVideo: undefined,
  contentRating: 'Everyone',
  contentRatingDescription: undefined,
  adSupported: false,
  released: undefined,
  updated: 1576868577000,
  version: 'Varies with device',
  recentChanges: 'Improved offline translations with upgraded language downloads',
  comments: [],
  preregister: false,
  earlyAccessEnabled: false,
  isAvailableInPlayPass: false,
  editorsChoice: true,
  features: [
    {
      title: 'Uses Google Play Games',
      description: 'For automatic sign-in, leaderboards, achievements, and more.'
    },
    {
      title: 'Achievements',
      description: 'Grants you achievements for completing goals and skill-based challenges.'
    }
  ],
  appId: 'com.google.android.apps.translate',
  url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.translate&hl=en&gl=us',
  isAvailableInPlayPass: false
}
```

### list
Retrieve a list of applications from one of the collections at Google Play. Options:

* `collection` (optional, defaults to `collection.TOP_FREE`): the Google Play collection that will be retrieved. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/b7669f78766b8306896447ddbe8797fe36eae49f/lib/constants.js#L67).
* `category` (optional, defaults to no category): the app category to filter by. Available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/b7669f78766b8306896447ddbe8797fe36eae49f/lib/constants.js#L10).
* `age` (optional, defaults to no age filter): the age range to filter the apps (only for FAMILY and its subcategories). Available options are `age.FIVE_UNDER`, `age.SIX_EIGHT`, `age.NINE_UP`.
* `num` (optional, defaults to 500): the amount of apps to retrieve.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
import gplay from "google-play-scraper";

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
    scoreText: '3.9',
    priceText: 'Free',
    free: false },
  { url: 'https://play.google.com/store/apps/details?id=com.yodo1.crossyroad',
    appId: 'com.yodo1.crossyroad',
    title: 'Crossy Road',
    summary: 'Embark on an action arcade, endless runner journey!',
    developer: 'Yodo1 Games',
    developerId: 'Yodo1+Games',
    icon: 'https://lh3.googleusercontent.com/doHqbSPNekdR694M-4rAu9P2B3V6ivff76fqItheZGJiN4NBw6TrxhIxCEpqgO3jKVg=w340',
    score: 4.5,
    scoreText: '4.5',
    priceText: 'Free',
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
import gplay from "google-play-scraper";

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
    scoreText: '4.1',
    priceText: 'Free',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.sgn.pandapop.gp',
    appId: 'com.sgn.pandapop.gp',
    summary: 'Plan your every pop to rescue baby pandas from the evil Baboon!',
    title: 'Panda Pop',
    developer: 'SGN',
    developerId: '5509190841173705883',
    icon: 'https://lh5.ggpht.com/uAAUBzEHtD_-mTxomL2wFxb5VSdtNllk9M4wjVdTGMD8pH79RtWGYQYrrtfVTjq7PV7M=w340',
    score: 4.2,
    scoreText: '4.2',
    priceText: 'Free',
    free: true } ]
```

### developer
Returns the list of applications by the given developer name. Options:

* `devId`: the name of the developer.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app list.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.
* `num` (optional, defaults to 60): the amount of apps to retrieve.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
import gplay from "google-play-scraper";

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
    scoreText: '3.9',
    priceText: 'Free',
    free: true },
  { url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies',
    appId: 'com.dxco.pandavszombies',
    title: 'Panda vs Zombie: panda ftw',
    summary: 'Help Rocky the Panda warrior to fight zombie games and save the Panda kind.',
    developer: 'DxCo Games',
    developerId: 'DxCo+Games',
    icon: 'https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w340',
    score: 4.5,
    scoreText: '4.5',
    priceText: 'Free',
    free: true } ]
```

### suggest
Given a string returns up to five suggestion to complete a search query term. Options:

* `term`: the term to get suggestions for.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the suggestions.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the suggestions.

Example:
```javascript
import gplay from "google-play-scraper";

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

You can get all reviews at once, by sending the `num` parameter (i.g. 5000), or paginated reviews (with 150 per page), by setting the `pagination` parameter to true;

You`ll have to choose wich method is better for your use case.

By setting `num` + `paginate`, the num parameter will be ignored and you will receive a paginated response instead.

Options:

* `appId`: Unique application id for Google Play. (e.g. id=com.mojang.minecraftpe maps to Minecraft: Pocket Edition game).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the reviews.
* `country` (optional, defaults to `'us'`): the two letter country code in which to fetch the reviews.
* `sort` (optional, defaults to `sort.NEWEST`): The way the reviews are going to be sorted. Accepted values are: `sort.NEWEST`, `sort.RATING` and `sort.HELPFULNESS`.
* `num` (optional, defaults to `100`): Quantity of reviews to be captured.
* `paginate` (optional, defaults to `false`): Defines if the result will be paginated
* `nextPaginationToken` (optional, defaults to `null`): The next token to paginate

Example:

```javascript
import gplay from "google-play-scraper";

// This example will return 3000 reviews
// on a single call
gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  num: 3000
}).then(console.log, console.log);

// This example will return the first page with 150 reviews paginated
// just send an empty nexPaginationToken
// you will receive a nextPaginationToken parameter in your response
gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  paginate: true,
  nextPaginationToken: null // you can omit this parameter
}).then(console.log, console.log);

// This example will return 150 reviews paginated
// for the next page (next page is the token return by the previous call)
// you will receive a nextPaginationToken parameter in your response
gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  paginate: true,
  nextPaginationToken: 'TOKEN_FROM_THE_PREVIOUS_REQUEST' // you can omit this parameter
}).then(console.log, console.log);
```

Results:

```javascript
{
  data: [
    {
      id: 'gp:AOqpTOFmAVORqfWGcaqfF39ftwFjGkjecjvjXnC3g_uL0NtVGlrrqm8X2XUWx0WydH3C9afZlPUizYVZAfARLuk',
      userName: 'Inga El-Ansary',
      userImage: 'https://lh3.googleusercontent.com/-hBGvzn3XlhQ/AAAAAAAAAAI/AAAAAAAAOw0/L4GY9KrQ-DU/w96-c-h96/photo.jpg',
      date: '2013-11-10T18:31:42.174Z',
      score: 5,
      scoreText: '5',
      url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&reviewId=Z3A6QU9xcFRPRWZaVHVZZ081NlNsRW9TV0hJeklGSTBvYTBTUlFQUUJIZThBSGJDX2s1Y1o0ZXRCbUtLZmgzTE1PMUttRmpRSS1YcFgxRmx1ZXNtVzlVS0Zz'
      title: 'I LOVE IT',
      text: 'It has skins and snowballs everything I wanted its so cool I love it!!!!!!!!',
      replyDate: '2013-11-10T18:31:42.174Z',
      replyText: 'thanks for playing Panda vs Zombies!',
      version: '1.0.2',
      thumbsUp: 29,
      criterias: [
        {
          criteria: 'vaf_games_simple',
          rating: 1
        },
        {
          criteria: 'vaf_games_realistic',
          rating: 1
        },
        {
          criteria: 'vaf_games_complex',
          rating: 1
        }
      ]
    },
    {
      id: 'gp:AOqpTOF39mpW-6gurlkCCTV_8qnKne7O5wcFsLc6iGVot5hHpplqPCqIiVL2fjximXNujuMjwQ4pkizxGrn13x0',
      userName: 'Millie Hawthorne',
      userImage: 'https://lh5.googleusercontent.com/-Q_FTAEBH2Qg/AAAAAAAAAAI/AAAAAAAAAZk/W5dTdaHCUE4/w96-c-h96/photo.jpg',
      date: '2013-11-10T18:31:42.174Z',
      url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&reviewId=Z3A6QU9xcFRPRmFHdlBFS2pGS2JVYW5Dd3kxTm1qUzRxQlYyc3Z4ZE9CYXRuc0hkclV3a09hbEFkOVdoWmw3eFN5VjF4cDJPLTg5TW5ZUjl1Zm9HOWc5NGtr',
      score: 5,
      scoreText: '5',
      title: 'CAN NEVER WAIT TILL NEW UPDATE',
      text: 'Love it but needs to pay more attention to pocket edition',
      replyDate: null,
      replyText: null,
      version: null,
      thumbsUp: 29
      criterias: []
    }
  ],
  nextPaginationToken: 'NEXT_PAGINATION_TOKEN'
}
```

### similar
Returns a list of similar apps to the one specified. Options:

* `appId`: the Google Play id of the application to get similar apps for.
* `lang` (optional, defaults to `'en'`): the two letter language code used to retrieve the applications.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications.
* `fullDetail` (optional, defaults to `false`): if `true`, an extra request will be made for every resulting app to fetch its full detail.

Example:

```javascript
import gplay from "google-play-scraper";

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
    scoreText: '3.3',
    priceText: '$2.16',
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
import gplay from "google-play-scraper";

gplay.permissions({appId: "com.dxco.pandavszombies"}).then(console.log);
```

Results:
```javascript
[ { permission: 'modify or delete the contents of your USB storage',
    type: 'Storage' },
  { permission: 'read the contents of your USB storage',
    type: 'Storage' },
  { permission: 'full network access',
    type: 'Photos/Media/Files' },
  { permission: 'view network connections',
    type: '' } ]
```

### datasafety
Returns the data safety information of an application. The data safety is categorized into lists of "data shared",
"data collected" and "security practices". Addtionally, the URL to the privacy policy is returned.

* `appId`: the Google Play id of the application to get permissions for.
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the permissions.

Example:

```javascript
import gplay from "google-play-scraper";

gplay.datasafety({appId: "com.dxco.pandavszombies"}).then(console.log);
```

Results:
```javascript
{ dataShared: [
    {
      data: 'User IDs',
      optional: false,
      purpose: 'Advertising or marketing, Account management',
      type: 'Personal info'
    },
    {
      data: 'Crash logs',
      optional: false,
      purpose: 'Analytics',
      type: 'App info and performance'
    }
  ],
  dataCollected: [
    {
      data: 'Name',
      optional: true,
      purpose: 'App functionality, Developer communications, Advertising or marketing',
      type: 'Personal info'
    },
    {
      data: 'Email address',
      optional: true,
      purpose: 'App functionality, Advertising or marketing, Account management',
      type: 'Personal info'
    },
    {
      data: 'User IDs',
      optional: false,
      purpose: 'App functionality, Analytics, Developer communications, Advertising or marketing, Fraud prevention, security, and compliance, Personalization, Account management',
      type: 'Personal info'
    },
    {
      data: 'Purchase history',
      optional: true,
      purpose: 'Account management',
      type: 'Financial info'
    },
    {
      data: 'Other in-app messages',
      optional: false,
      purpose: 'Developer communications, Fraud prevention, security, and compliance',
      type: 'Messages'
    },
    {
      data: 'Contacts',
      optional: true,
      purpose: 'App functionality',
      type: 'Contacts'
    },
    {
      data: 'Other actions',
      optional: false,
      purpose: 'App functionality, Analytics, Fraud prevention, security, and compliance',
      type: 'App activity'
    },
    {
      data: 'Crash logs',
      optional: true,
      purpose: 'App functionality, Analytics',
      type: 'App info and performance'
    },
    {
      data: 'Other app performance data',
      optional: false,
      purpose: 'Analytics',
      type: 'App info and performance'
    },
    {
      data: 'Device or other IDs',
      optional: false,
      purpose: 'App functionality, Analytics, Advertising or marketing, Fraud prevention, security, and compliance, Personalization, Account management',
      type: 'Device or other IDs'
    }
  ],
  securityPractices: [
    {
      practice: 'Data isn’t encrypted',
      description: 'Your data isn’t transferred over a secure connection'
    },
    {
      practice: 'You can request that data be deleted',
      description: 'The developer provides a way for you to request that your data be deleted'
    }
  ],
  privacyPolicyUrl: 'http://www.jamcity.com/privacy' }
```

### categories
Retrieve a full list of categories present from dropdown menu on Google Play.

* this method has no options

Example:

```javascript
import gplay from "google-play-scraper";

gplay.categories().then(console.log);
```

Results:
```javascript
[ 'AUTO_AND_VEHICLES',
  'LIBRARIES_AND_DEMO',
  'LIFESTYLE',
  'MAPS_AND_NAVIGATION',
  'BEAUTY',
  'BOOKS_AND_REFERENCE',
  ...< 51 more items> ]
```

## Memoization

Since every library call performs one or multiple requests to
an Google Play API or web page, sometimes it can be useful to cache the results
to avoid requesting the same data twice. The `memoized` function returns a
store object that caches its results:

```js
import {memoized as m} from "google-play-scraper"; // cache with default options
const memoized = m();// cache with customized options
const memoizedCustom = m({ maxAge: 1000 * 60 });// cache with customized options

// first call will hit google play and cache the results
memoized.developer({devId: "DxCo Games"}).then(console.log);

// second call will return cached results
memoized.developer({devId: "DxCo Games"}).then(console.log);
```

The options available are those supported by the [memoizee](https://github.com/medikoo/memoizee) module.
By default up to 1000 values are cached by each method and they expire after 5 minutes.

## Throttling

All methods on the scraper have to access the Google Play server in one
form or another. When making too many requests in a short period of time
(specially when using the `fullDetail` option), it is common to hit Google Play's
throttling limit. That means requests start getting status 503 responses with
a captcha to verify if the requesting entity is a human (which is not :P).
In those cases the requesting IP can be banned from making further requests for a
while (usually around an hour).

To avoid this situation, all methods now support a `throttle` property, which
defines an upper bound to the amount of requests that will be attempted per second.
Once that limit is reached, further requests will be held until the second passes.

```js
import gplay from "google-play-scraper";

// the following method will perform batches of 10 requests per second
gplay.search({term: 'panda', throttle: 10}).then(console.log);
```

By default, no throttling is applied.
