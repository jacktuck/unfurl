let pify = require('pify')
let sax = require('sax')
let _ = require('lodash')
let request = require('request')
let promisedRequest = pify(request)

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
  'og:video:type',
  'og:video:tag'
]

let twitter = [
  'twitter:url',
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

let oembed = [
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

let zipable = [
  'og:image',
  'twitter:image',
  'twitter:player',
  'og:video',
  'og:audio'
]

module.exports = async function (url, opts) {
  opts = _.defaults(opts || Object.create(null), {
    ogp: true,
    twitter: true,
    oembed: true,
    other: true
  })

  let metadata = await scrape(url, opts)

  if (opts.oembed && metadata.oembed) {
    let oembedData = await fetch(metadata.oembed, true)

    if (_.get(oembedData, 'body')) {
      metadata.oembed = _(JSON.parse(oembedData.body))
        .pickBy((v, k) => _.includes(oembed, k))
        .mapKeys((v, k) => _.camelCase(k))
        .value()
    } else {
      metadata.oembed = null
    }
  }

  return metadata
}

function fetch (url, promisify = false) {
  // debug('fetching', url)
  let r = promisify ? promisedRequest : request
  return r.get({
    url,
    gzip: true,
    headers: {
      'user-agent': 'facebookexternalhit'
    }
  })
}

async function scrape (url, opts) {
  let obj = Object.create(null)

  return new Promise((resolve, reject) => {
    let parser = sax.parser(false, {
      lowercase: true
    })

    let req = fetch(url)

    parser.onerror = function (err) {
      reject(err)
    }

    parser.ontext = function (text) {
      let tag = parser.tagName

      if (tag === 'title' && opts.other) {
        (obj.other || (obj.other = {})).title = text
      }
    }

    parser.onopentag = function ({ name, attributes: attr }) {
      let dest = attr.property || attr.name
      let prettyDest = _.camelCase(dest)

      if (opts.oembed && attr.type === 'application/json+oembed') {
        obj.oembed = attr.href
        return
      }

      if (name !== 'meta') return

      // debug('dest', dest)
      // debug('prettyDest', prettyDest)

      let zipee

      let shouldZip = _.some(zipable, function (k) {
        let isZippable = _.startsWith(dest, k)
        if (isZippable) zipee = _.camelCase(k)
        return isZippable
      })
      debug('zipee', zipee)

      // debug('shouldZip', shouldZip)

      if (opts.ogp && _.includes(ogp, dest)) {
        let target = (obj.ogp || (obj.ogp = {})) // [prettyDest]
        if (shouldZip) {
          target = (target[zipee] || (target[zipee]=[{}]))[0]

          let namePart = prettyDest.slice(zipee.length)

          let prop = !namePart ? 'url' : _.camelCase(namePart)
          target[prop] = attr.content

          return
        }

        target[prettyDest] = attr.content

        return
      }

      if (opts.twitter && _.includes(twitter, dest)) {
        let target = (obj.ogp || (obj.ogp = {})) // [prettyDest]
        if (shouldZip) {
          target = (target[zipee] || (target[zipee]=[{}]))[0]

          let namePart = prettyDest.slice(zipee.length)

          let prop = !namePart ? 'url' : _.camelCase(namePart)
          target[prop] = attr.content

          return
        }

        target[prettyDest] = attr.content

        return
      }

      if (opts.other) {
        (obj.other || (obj.other = {}))[prettyDest] = attr.content
        return
      }
    }

    parser.onclosetag = function (tag) {
      // debug('onclosetag',tag)

      if (tag === 'head') {
        // debug('ABORTING')
        debug('DONE', require('util').inspect(obj, false, null))
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
