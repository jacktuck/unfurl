let pify = require('pify')
let sax = require('sax')
let _ = require('lodash')
let request = require('request')
let requestPromise = pify(request)

let debug = require('debug')('og')

// TODO make a proxy for these fields...
// zip up the images / video etc
// add option for allowing multiple of video or image or audio

let rollupWhen = [
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
        .mapKeys((v, k) => _.camelCase(k))
        .value()
    } else {
      metadata.oembed = null
    }
  }

  return metadata
}

function fetch (url, returnPromise) {
  // debug('fetching', url)
  let r = returnPromise ? requestPromise : request
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
        target = (unfurled.other || (unfurled.other = {}))
        rollup(target, 'title', text)
      }
    }

    function rollup (target, name, val) {
      let rollupTo = _.find(rollupWhen, _.partial(_.startsWith, name))

      rollupAs = _.camelCase(rollupAs)
      name = _.camelCase(name)

      debug('rollupAs', rollupAs)
      debug('name', name)

      if (rollupTo) {
        target = _.last((target[rollupTo] || (target[rollupTo] = [{}])))

        let namePart = name.slice(rollupTo.length)

        let prop = !namePart ? 'url' : namePart
        target[prop] = val

        return
      }

      target[name] = val
    }

    parser.onopentag = function ({ name, attributes: attr }) {
      let prop = attr.property || attr.name
      let val = attr.content

      if (opts.oembed && attr.type === 'application/json+oembed') {
        unfurled.oembed = attr.href
        return
      }

      if (name !== 'meta') return

      debug('prop=', prop)
      debug('val=', val)

      if (opts.ogp && _.includes(prop, 'og')) {
        let target = (unfurled.ogp || (unfurled.ogp = {}))

        rollup(target, prop, val)

        return
      }

      if (opts.twitter && _.includes(prop, 'twitter')) {
        let target = (unfurled.twitter || (unfurled.twitter = {}))

        rollup(target, prop, val)

        return
      }

      if (opts.other) {
        let target = (unfurled.other || (unfurled.other = {}))

        rollup(target, prop, val)

        return
      }
    }

    parser.onclosetag = function (tag) {
      // debug('onclosetag',tag)

      if (tag === 'head') {
        debug('ABORTING')
        debug('DONE', require('util').inspect(unfurled, false, null))

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
