# Unfurl

[![npm package](https://nodei.co/npm/unfurl.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/unfurl.js/)

[![Travis CI](https://img.shields.io/travis/jacktuck/unfurl.svg?style=flat-square)](https://travis-ci.org/jacktuck/unfurl)
[![Coverage Status](https://img.shields.io/coveralls/jacktuck/unfurl.svg?style=flat-square)](https://coveralls.io/github/jacktuck/unfurl?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jacktuck/unfurl/badge.svg?style=flat-square)](https://snyk.io/test/github/jacktuck/unfurl)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/jacktuck/unfurl.svg?style=flat-square)](https://scrutinizer-ci.com/g/jacktuck/unfurl/?branch=master)
[![David Badge](https://img.shields.io/david/jacktuck/unfurl.svg?style=flat-square)](https://david-dm.org/jacktuck/unfurl)
![NPM](https://img.shields.io/npm/v/unfurl.js.svg?style=flat-square)
[![pledge](https://img.shields.io/badge/community-pledge-ff69b4.svg?style=flat-square)](https://github.com/jacktuck/unfurl/blob/master/code-of-conduct.md)

## So, like, what does _unfurl_ even mean?
>Spread out from a rolled or folded state

<img width="400" src="https://cdn-images-1.medium.com/max/1600/1*QOMaDLcO8rExD0ctBV3BWg.png">

[Source](https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254)

## Install

`yarn add unfurl.js`

## Usage

### unfurl(url [,opts])

#### url - `string` of url _or_ `object` of:
- `uri` || `url` - fully qualified uri or a parsed url object from `url.parse()`
- `baseUrl` - fully qualified uri string used as the base url
- `headers` - http headers (default: `{ 'user-agent': 'facebookexternalhit' }`)

---

#### opts - `object` of:
* `ogp` - get open graph metadata (`true | false`) (default: `true`)
* `twitter` - get twitter-card metadata (`true | false`)  (default: `true`)
* `oembed` - get oembed metadata (`true | false`) (default: `true`)
* `other` - get other metadata too (e.g. description and title) (`true | false`) (default: `true`)

## Examples
```js
var unfurl = require('unfurl.js')

unfurl('http://example.com')
  .then(console.log)
  .catch(console.error)
```

_Or if you're cool and use [ES7 async await](https://jakearchibald.com/2014/es7-async-functions/)_

<img src="https://media.giphy.com/media/MqxZxTlvcY5BS/giphy.gif" width="350">

```js
var unfurl = require('unfurl.js')

;(async function () {
  let result = await unfurl('https://imgur.com/gallery/fhAIf')
  console.log('result', result)
})().catch(console.error)
```

## Try it out!

```
curl https://unfurl.now.sh/?url=https://github.com/zeit/micro
```

_Thanks to [micro-unfurl](https://github.com/beeman/micro-unfurl)_
