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
  let unfurled = Object.create(null)

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
        (unfurled.other || (unfurled.other = {})).title = text
      }
    }

    function rollup (target, name, val) {
      let zipee

      let shouldZip = _.some(zipable, function (k) {
        let isZippable = _.startsWith(name, k)
        if (isZippable) zipee = k
        return isZippable
      })
      // debug('zipee', zipee)
      // debug('name', name)

      if (shouldZip) {
        target = _.last((target[zipee] || (target[zipee] = [{}])))

        let namePart = name.slice(zipee.length)

        let prop = !namePart ? 'url' : _.camelCase(namePart)
        target[prop] = val

        return
      }

      target[name] = val
    }

    parser.onopentag = function ({ name, attributes: attr }) {
      let prop = attr.property || attr.name

      if (opts.oembed && attr.type === 'application/json+oembed') {
        unfurled.oembed = attr.href
        return
      }

      if (name !== 'meta') return

      if (opts.ogp && _.includes(ogp, prop)) {
        let target = (unfurled.ogp || (unfurled.ogp = {}))

        rollup(target, prop, attr.content)

        return
      }

      if (opts.twitter && _.includes(twitter, prop)) {
        let target = (unfurled.twitter || (unfurled.twitter = {})) // [prettyDest]

        rollup(target, prop, attr.content)

        return
      }

      if (opts.other) {
        let target = (unfurled.other || (unfurled.other = {}))

        rollup(target, prop, attr.content)

        return
      }
    }

    parser.onclosetag = function (tag) {
      // debug('onclosetag',tag)

      if (tag === 'head') {
        // debug('ABORTING')
        // debug('DONE', require('util').inspect(unfurled, false, null))
        resolve(unfurled)
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
      resolve(unfurled)
    })
  })
}
