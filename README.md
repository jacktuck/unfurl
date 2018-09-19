# Unfurl
_(unroll, unfold, or spread out or be unrolled, unfolded, or spread out from a furled state)_

A metadata scraper with support for oEmbed, Twitter Cards and Open Graph Protocol for Node.js (>=v6.0.0)

[![Travis CI](https://img.shields.io/travis/jacktuck/unfurl.svg?style=flat-square)](https://travis-ci.org/jacktuck/unfurl)
[![Coverage Status](https://img.shields.io/coveralls/jacktuck/unfurl.svg?style=flat-square)](https://coveralls.io/github/jacktuck/unfurl?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jacktuck/unfurl/badge.svg?style=flat-square)](https://snyk.io/test/github/jacktuck/unfurl)
![NPM](https://img.shields.io/npm/v/unfurl.js.svg?style=flat-square)

## What does it do do?
Unfurl will take a `url` and some `options`, fetch the `url`, extract the metadata we care about and format the result in a saine way. It supports all major metadata providers and expanding it to work for any others should be trivial.

## Why would I need it?
So you know when you link to something on Slack, or Facebook, or Twitter - they typically show a preview of the link. To do so they have crawled the linked website for metadata and enriched the link by providing more context about it. Which usually entails grabbing its title, description and image/player embed.

## Usage
### unfurl(url [, opts])
#### url - `string`
---
#### opts - `object` of:
-  `oembed?: boolean` - support retreiving oembed metadata
-  `timeout?  number` - req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies) 
-  `follow?: number` - maximum redirect count. 0 to not follow redirect
-  `compress?: boolean` - support gzip/deflate content encoding 
-  `size?: number` - maximum response body size in bytes. 0 to disable 
-  `agent?: string | null` - http(s).Agent instance, allows custom proxy, certificate, lookup, family etc.
---
#
```
const unfurl = require('./unfurl.js')
const result = unfurl('https://github.com/trending')
```
---
#### result `<Promise<Metadata>>`
```typescript
type Metadata = {
  oEmbed?: {
    type: 'photo' | 'video' | 'link' | 'rich'
    version?: string
    title?: string
    author_name?: string
    author_url?: string
    provider_name?: string
    provider_url?: string
    cache_age?: number
    thumbnails?: {
      url?: string
      width?: number
      height?: number
    }[]
  }
  twitter_card: {
    card: string
    site?: string
    creator?: string
    creator_id?: string
    title?: string
    description?: string
    players?: {
      url: string
      stream?: string
      height?: number
      width?: number
    }[]
    apps: {
      iphone: {
        id: string
        name: string
        url: string
      }
      ipad: {
        id: string
        name: string
        url: string
      }
      googleplay: {
        id: string
        name: string
        url: string
      }
    },
    images: {
      url: string
      alt: string
    }[]
  }
  open_graph: {
    title: string
    type: string
    images?: {
      url: string
      secure_url?: string
      type: string
      width: number
      height: number
    }[]
    url?: string
    audio?: {
      url: string
      secure_url?: string
      type: string 
    }[]
    description?: string
    determiner?: string
    locale: string
    locale_alt: string
    videos: {
      url: string
      stream?: string
      height?: number
      width?: number
      tags?: string[]
    }[]
  }
}
```