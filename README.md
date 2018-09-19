# Unfurl

[![Travis CI](https://img.shields.io/travis/jacktuck/unfurl.svg?style=flat-square)](https://travis-ci.org/jacktuck/unfurl)
[![Coverage Status](https://img.shields.io/coveralls/jacktuck/unfurl.svg?style=flat-square)](https://coveralls.io/github/jacktuck/unfurl?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jacktuck/unfurl/badge.svg?style=flat-square)](https://snyk.io/test/github/jacktuck/unfurl)
![NPM](https://img.shields.io/npm/v/unfurl.js.svg?style=flat-square)
[![pledge](https://img.shields.io/badge/community-pledge-ff69b4.svg?style=flat-square)](https://github.com/jacktuck/unfurl/blob/master/code-of-conduct.md)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjacktuck%2Funfurl.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjacktuck%2Funfurl?ref=badge_shield)

A metadata scraper with support for oEmbed, Twitter Cards and Open Graph Protocol for Node.js (>=v7.0.0)

## What does Unfurl mean?
**Verb**: _unroll, unfold, or spread out or be unrolled, unfolded, or spread out from a furled state_

## What does Unfurl do?
So you know when you link to something on Slack, or Facebook, or Twitter - they typically show a preview of the link. To do so they have crawled the linked website for metadata and enriched the link by providing more context about it. Which usually entails grabbing its title, description and image/player embed.

<img width="400" src="https://cdn-images-1.medium.com/max/1600/1*QOMaDLcO8rExD0ctBV3BWg.png">

[Image source](https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254)

## Install
`npm install unfurl.js`

## Usage

### unfurl(url [,opts])

#### url - `string` of url _or_ `object` of:
- `uri` || `url` - fully qualified uri or a parsed url object from `url.parse()`
- `baseUrl` - fully qualified uri string used as the base url
- `headers` - http headers (default: `{ 'user-agent': 'facebookexternalhit' }`)

---

#### opts - `object` of:
* `ogp` - get open graph protocol metadata (`true | false`) (default: `true`)
* `twitter` - get twitter-card metadata (`true | false`)  (default: `true`)
* `oembed` - get oembed metadata (`true | false`) (default: `true`)
* `other` - get other metadata too (e.g. description and title) (`true | false`) (default: `true`)

## Examples
```js
var unfurl = require('unfurl.js')

unfurl('https://github.com/zeit/micro')
  .then(console.log)
  .catch(console.error)
```

_Or if you're cool and use [ES7 async await](https://jakearchibald.com/2014/es7-async-functions/)_

<img src="https://media.giphy.com/media/MqxZxTlvcY5BS/giphy.gif" width="350">

```js
var unfurl = require('unfurl.js')

;(async function () {
  let result = await unfurl('https://github.com/zeit/micro')

})().catch(console.error)
```

## Try it out!

```
curl https://unfurl.now.sh/?url=https://github.com/zeit/micro
```

Credit to [micro-unfurl](https://github.com/beeman/micro-unfurl) and [now](https://zeit.co/now)

```
{
  "other": {
    "dnsPrefetch": "https://user-images.githubusercontent.com/",
    "stylesheet": "https://assets-cdn.github.com/assets/site-92f236714908.css",
    "viewport": "width=device-width",
    "title": "GitHub - zeit/micro: Asynchronous HTTP microservices\n  ",
    "search": "/opensearch.xml",
    "fluidIcon": "https://github.com/fluidicon.png",
    "fbAppId": "1401488693436528",
    "assets": "https://assets-cdn.github.com/",
    "pjaxTimeout": "1000",
    "requestId": "A378:1E00:331A1:4C5F5:5A9736E4",
    "selectedLink": "repo_source",
    "googleSiteVerification": "GXs5KoUUkNCoaAZn7wPN-t01Pywp9M3sEjnt_3_ZWPc",
    "googleAnalytics": "UA-3769691-2",
    "octolyticsHost": "collector.githubapp.com",
    "octolyticsAppId": "github",
    "octolyticsEventUrl": "https://collector.githubapp.com/github-external/browser_event",
    "octolyticsDimensionRequestId": "A378:1E00:331A1:4C5F5:5A9736E4",
    "octolyticsDimensionRegionEdge": "sea",
    "octolyticsDimensionRegionRender": "iad",
    "hydroEventsUrl": "https://github.com/hydro_browser_events",
    "analyticsLocation": "/<user-name>/<repo-name>",
    "dimension1": "Logged Out",
    "hostname": "github.com",
    "expectedHostname": "github.com",
    "jsProxySiteDetectionPayload": "NGEwNjkzNDk2NzRmZDQwYmM1MjEyY2FiOWNiMWNiMzJkOTRlMTQ2YTYyZTYyMTdiYjk4YTZjZWM4NmI1OTI4Nnx7InJlbW90ZV9hZGRyZXNzIjoiMTMuNTcuMTkzLjMyIiwicmVxdWVzdF9pZCI6IkEzNzg6MUUwMDozMzFBMTo0QzVGNTo1QTk3MzZFNCIsInRpbWVzdGFtcCI6MTUxOTg1OTQyOSwiaG9zdCI6ImdpdGh1Yi5jb20ifQ==",
    "enabledFeatures": "UNIVERSE_BANNER,FREE_TRIALS,MARKETPLACE_INSIGHTS,MARKETPLACE_INSIGHTS_CONVERSION_PERCENTAGES",
    "htmlSafeNonce": "8ce9f95a3b17cee0d064b33f1ecf193e7c1e17da",
    "alternate": "https://github.com/zeit/micro/commits/master.atom",
    "description": "Asynchronous HTTP microservices",
    "goImport": "github.com/zeit/micro git https://github.com/zeit/micro.git",
    "octolyticsDimensionUserId": "14985020",
    "octolyticsDimensionUserLogin": "zeit",
    "octolyticsDimensionRepositoryId": "50224698",
    "octolyticsDimensionRepositoryNwo": "zeit/micro",
    "octolyticsDimensionRepositoryPublic": "true",
    "octolyticsDimensionRepositoryIsFork": "false",
    "octolyticsDimensionRepositoryNetworkRootId": "50224698",
    "octolyticsDimensionRepositoryNetworkRootNwo": "zeit/micro",
    "octolyticsDimensionRepositoryExploreGithubMarketplaceCiCtaShown": "false",
    "canonical": "https://github.com/zeit/micro",
    "browserStatsUrl": "https://api.github.com/_private/browser/stats",
    "browserErrorsUrl": "https://api.github.com/_private/browser/errors",
    "maskIcon": "https://assets-cdn.github.com/pinned-octocat.svg",
    "icon": "https://assets-cdn.github.com/favicon.ico",
    "themeColor": "#1e2327",
    "manifest": "/manifest.json"
  },
  "ogp": {
    "ogImage": [
      {
        "url": "https://avatars3.githubusercontent.com/u/14985020?s=400&v=4"
      }
    ],
    "ogSiteName": "GitHub",
    "ogType": "object",
    "ogTitle": "zeit/micro",
    "ogUrl": "https://github.com/zeit/micro",
    "ogDescription": "Asynchronous HTTP microservices"
  }
}
```


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjacktuck%2Funfurl.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjacktuck%2Funfurl?ref=badge_large)
