[![Code Climate](https://img.shields.io/codeclimate/github/jacktuck/unfurled.svg?style=flat-square)](https://codeclimate.com/github/jacktuck/unfurled)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/jacktuck/unfurled.svg?style=flat-square)](https://scrutinizer-ci.com/g/jacktuck/unfurled/?branch=master)
[![Codacy Badge](https://img.shields.io/codacy/grade/dc49062a0a024ac2baf4e4311ec5a599.svg?style=flat-square)](https://www.codacy.com/app/jacktuck/unfurled)
[![David Badge](https://img.shields.io/david/jacktuck/unfurled.svg?style=flat-square)](https://david-dm.org/jacktuck/unfurled)


# Unfurled

## So, like, what does _unfurl_ even mean?
>Spread out from a rolled or folded state

## Install

`yarn add unfurled`

## Usage

### unfurled(url [,opts])

#### url - `string` of url _or_ `object` of:
- `uri` || `url` - fully qualified uri or a parsed url object from `url.parse()`
- `baseUrl` - fully qualified uri string used as the base url
- `headers` - http headers (default: `{ 'user-agent': 'facebookexternalhit' }`)

---

#### opts - `object` of:
* `ogp` - get open graph metadata (`true || false`) (default: `true`)
* `twitter` - get twitter-card metadata (`true || false`)  (default: `true`)
* `oembed` - get oembed metadata (`true || false`) (default: `true`)
* `other` - get other metadata too (e.g. description and title) (`true || false`) (default: `true`)

## Examples
```js
var unfurled = require('unfurled')

unfurled('http://example.com')
  .then(console.log)
  .catch(console.error)
```

_Or if you're cool and use [ES7 async await](https://jakearchibald.com/2014/es7-async-functions/)_

<img src="https://media.giphy.com/media/MqxZxTlvcY5BS/giphy.gif" width="350">

```js
var unfurled = require('unfurled')

;(async function () {
  let result = await unfurl('https://imgur.com/gallery/fhAIf')
  console.log('result', result)
})().catch(console.error)
```

## Response
_Response from scraping https://imgur.com/gallery/fhAIf_

Note: Discovered metadata keys should be camelCased

```js
{
	other: {
		viewport: 'width=1138',
		robots: 'follow, index',
		keywords: 'images, funny, image host, image sharing, reaction gif, viral images, current events, cute, visual storytelling, gif',
		description: 'Album with topic of No Topic, tagged with  and ; uploaded by kikiistgeil. When I log in to imgur and now I have to fight zombies',
		copyright: 'Copyright 2017 Imgur, Inc.',
		msapplicationTileColor: '#2cd63c',
		msapplicationTileImage: '//s.imgur.com/images/favicon-144.png',
		pDomainVerify: 'a1e7abe8af908cc6dfaf935dd9a20384',
		fbAdmins: '12301369',
		fbAppId: '127621437303857',
		alAndroidUrl: 'imgur://imgur.com/gallery/fhAIf?from=fbreferral',
		alAndroidAppName: 'Imgur',
		alAndroidPackage: 'com.imgur.mobile',
		alIosUrl: 'imgur://imgur.com/gallery/fhAIf?from=fbreferral',
		alIosAppStoreId: '639881495',
		alIosAppName: 'Imgur',
		alWebUrl: 'http://imgur.com/gallery/fhAIf',
		twitterDomain: 'imgur.com',
		author: 'Imgur',
		articleAuthor: 'Imgur',
		articlePublisher: 'https://www.facebook.com/imgur'
	},
	oembed: {
		version: '1.0',
		type: 'rich',
		providerName: 'Imgur',
		providerUrl: 'https://imgur.com',
		width: 540,
		height: 500,
		html: '<blockquote class="imgur-embed-pub" lang="en" data-id="a/fhAIf"><a href="http://imgur.com/a/fhAIf">When I log in to imgur and now I have to fight zombies</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>'
	},
	ogp: {
		ogUrl: 'http://imgur.com/gallery/fhAIf',
		ogSiteName: 'Imgur',
		ogTitle: 'When I log in to imgur and now I have to fight zombies',
		ogType: 'article',
		ogImage: [{
			url: 'http://i.imgur.com/SIarU3i.jpg?fb',
			width: '600',
			height: '315'
		}],
		ogDescription: 'Imgur: The most awesome images on the Internet.'
	},
	twitter: {
		twitterSite: '@imgur',
		twitterAppIdGoogleplay: 'com.imgur.mobile',
		twitterTitle: 'When I log in to imgur and now I have to fight zombies',
		twitterCard: 'summary_large_image',
		twitterImage: [{
			url: 'https://i.imgur.com/SIarU3ih.jpg'
		}],
		twitterDescription: 'Imgur: The most awesome images on the Internet.'
	}
}
```
