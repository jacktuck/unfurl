let sax = require('sax')
let _ = require('lodash')
let request = require('request')
let debug = require('debug')('og')

// TODO make a proxy for these fields...
// zip up the images / video etc
// add option for allowing multiple of video or image or audio

let ogp = [
  'og:title',
  'og:type',
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'og:image:width',
  'og:image:height',
  'og:image:type',
  'og:url',
  'og:audio',
  'og:audio:url',
  'og:audio:secure_url',
  'og:audio:type',
  'og:description',
  'og:determiner',
  'og:locale',
  'og:locale:alternate',
  'og:site_name',
  'og:video',
  'og:video:url',
  'og:video:secure_url',
  'og:video:width',
  'og:video:height',
  'og:video:type'
]

let twitter = [
  'twitter:card',
  'twitter:site',
  'twitter:site:id',
  'twitter:creator',
  'twitter:creator:id',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'twitter:image:height',
  'twitter:image:width',
  'twitter:image:alt',
  'twitter:player',
  'twitter:player:width',
  'twitter:player:height',
  'twitter:player:stream',
  'twitter:app:name:iphone',
  'twitter:app:id:iphone',
  'twitter:app:url:iphone',
  'twitter:app:name:ipad',
  'twitter:app:id:ipad',
  'twitter:app:url:ipad',
  'twitter:app:name:googleplay',
  'twitter:app:id:googleplay',
  'twitter:app:url:googleplay'
]

let oEmbed = [
  'type',
  'version',
  'title',
  'author_name',
  'author_url',
  'provider_name',
  'provider_url',
  'cache_age',
  'thumbnail_url',
  'thumbnail_width',
  'thumbnail_height'
]

let multi = [
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'og:image:width',
  'og:image:height',
  'og:image:type',
  'twitter:image',
  'twitter:image:height',
  'twitter:image:width',
  'twitter:image:alt',
  'twitter:player',
  'twitter:player:width',
  'twitter:player:height',
  'twitter:player:stream',
  'og:video',
  'og:video:url',
  'og:video:secure_url',
  'og:video:width',
  'og:video:height',
  'og:video:type',
  'og:audio',
  'og:audio:url',
  'og:audio:secure_url',
  'og:audio:type'
]

let allProviders = _.concat(ogp, twitter)

let fallbacks = Object.create(null)

module.exports = async function (url, opts) {
  opts = _.defaults(opts || Object.create(null), {
    ogp: true,
    twitter: true,
    oEmbed: true,
    shouldFallbackDescription: true,
    shouldFallbackTitle: true
  })

  let metadata = await scrape(url, opts)

  // if (opts.ogp || opts.twitter) {
  // }

  return metadata
}

function fetch (url) {
  return request.get({
    url,
    gzip: true,
    headers: {
      'user-agent': 'facebookexternalhit'
    }
  })
}

async function scrape (url, opts) {
  return new Promise((resolve, reject) => {
    let parser = sax.parser(false, {
      lowercase: true
    })

    let obj = Object.create(null)

    let req = fetch(url)

    parser.onerror = function (err) {
      reject(err)
    }

    parser.ontext = function (text) {
      let tag = parser.tagName

      if (tag === 'title') fallbacks.title = text
    }

    parser.onopentag = function ({ name, attributes: attr }) {
      let ctx = (opts.twitter) ? allProviders : ogp

      let predicate = attr.property || attr.name

      if (name !== 'meta') return
      if (!_.includes(ctx, predicate)) return

      let prettyName = _.camelCase(predicate)

      obj[prettyName] = attr.content
    }

    parser.onclosetag = function (tag) {
      // debug('onclosetag',tag)

      if (tag === 'head') {
        // debug('ABORTING')
        resolve(obj)
        req.abort() // Parse as little as possible.
      }
    }

    req.on('data', (data) => {
      if (parser.write(data) === false) req.pause()
      else parser.flush()
    })

    req.on('drain', () => {
      // debug('REQUEST DRAIN')
      req.resume()
    })

    req.on('abort', () => {
      // debug('REQUEST ABORT')
    })

    req.on('end', () => {
      // debug('REQUEST END')
      resolve(obj)
    })
  })
}
