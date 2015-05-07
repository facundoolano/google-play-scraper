# google-play-scraper
Scrapes basic application data from the Google Play store.

## Usage
### Get an App detail

The App function is used to retrieve the full detail of an application. 

```javascript
var gplay = require('google-play-scrapper');

gplay.App('com.dxco.pandavszombies')
  .then(function(app){
    console.log('Retrieved application: ' + app.title);
  })
  .catch(function(e){
    console.log('There was an error fetching the application!');
  });
```
The returned app object has the following format:

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

The App function takes the app id (the `?id=` parameter on the application url) and an optional parameter to specify the language in which to fetch the app page (for example 'es' for Spanish. Defaults to 'en'). 

### Get an App list
The List function allows to retrieve a list of applications from one of the collections at Google Play:

```javascript
var gplay = require('google-play-scrapper');

gplay.List({
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
The result will look like:

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

The List function takes a configuration object which accepts the following parameters:
* `collection`: the Google Play collection that will be retrieved. Defaults to `collection.TOP_FREE`, available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L49).
* `category`: the app category to filter by. Defaults to no category, available options can bee found [here](https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L2).
* `num`: the amount of apps to retrieve. Max allowed is 120, defaults to 60.
* `start`: the starting index of the retrieved list. Max allowed is 500, defaults to 0.
* `lang`: the two letter language code used to retrieve the applications. Defaults to `'en'`.
