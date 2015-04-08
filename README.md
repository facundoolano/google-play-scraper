# google-play-scraper
Scrapes basic application data from the Google Play store.

## Usage

The GooglePlay function takes the application id (the `?id=` parameter on the application url) and an optional parameter to specify the language in which to fetch the app page (for example "es" for Spanish. Defaults to "en").

```javascript
var GooglePlay = require("google-play-scrapper");

GooglePlay("com.dxco.pandavszombies")
  .then(function(app){
    console.log("Retrieved application: " + app.title);
  })
  .catch(function(e){
    console.log("There was an error fetching the application!");
  });
```

The returned app object has the following format:

```javascript
{
  appId: "com.dxco.pandavszombies",
  title: "Panda vs Zombie: Elvis rage",
  url: "https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&hl=en",
  icon: "https://lh6.ggpht.com/5mI27oolnooL__S3ns9qAf_6TsFNExMtUAwTKz6prWCxEmVkmZZZwe3lI-ZLbMawEJh3=w300",
  minInstalls: 10000,
  maxInstalls: 50000,
  score: 4.9,
  reviews: 2312,
  description: "Everyone in town has gone zombie.",
  descriptionHTML: "Everyone in town has gone <b>zombie</b>.",
  developer: "DxCo Games",
  genre: "Action"
}
```
