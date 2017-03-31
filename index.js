let pify = require('pify')
let htmlparser2 = require('htmlparser2')
let _ = require('lodash')
let request = require('request')
let promisedRequest = pify(request)

let debug = require('debug')('unfurled')

let ogp = require('./lib/ogp')
let twitter = require('./lib/twitter')
let oembed = require('./lib/oembed')

let shouldRollup = [
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
    debug('oembedData=', oembedData.body)

    if (_.get(oembedData, 'body')) {
      metadata.oembed = _(JSON.parse(oembedData.body))
        .pickBy((v, k) => _.includes(oembed, k))
        .mapKeys((v, k) => _.camelCase(k))
        .value()
    } else {
      metadata.oembed = null
    }
  }
  debug('metadata', metadata)

  return metadata
}

function fetch (url, promisify = false) {
  debug('fetch url=', url)
  let r = promisify ? promisedRequest : request
  return r.get({
    url,
    // gzip: true,
    headers: {
      'user-agent': 'facebookexternalhit'
    }
  })
}

async function scrape (url, opts) {
  debug('scrape url=', url)
  debug('scrape opts=', opts)

  let unfurled = Object.create(null)

  return new Promise((resolve, reject) => {
    let parser = new htmlparser2.Parser({
    	onopentag,
      ontext,
      onclosetag
    }, {decodeEntities: true})

    let req = fetch(url)

    function rollup (target, name, val) {
      if (!name || !val) return

      let rollupAs = _.find(shouldRollup, function (k) {
        return _.startsWith(name, k)
      })

      if (rollupAs) {
        let namePart = name.slice(rollupAs.length)
        let prop = !namePart ? 'url' : _.camelCase(namePart)
        rollupAs = _.camelCase(rollupAs)

        target = (target[rollupAs] || (target[rollupAs] = [{}]))

        let last = _.last(target)
        last = (last[prop] ? (target.push({}) && _.last(target)) : last)

        debug('rollup prop=', prop)
        debug('rollup val=', val)

        last[prop] = val

        return
      }

      let prop = _.camelCase(name)

      debug('rollup prop=', prop)
      debug('rollup val=', val)

      target[prop] = val
    }

    function onerror (err) {
      debug('ONERROR')

      reject(err)
    }


    function ontext (text) {
      debug('ONTEXT')

      let tag = parser.tagName

      if (tag === 'title' && opts.other) {
        (unfurled.other || (unfurled.other = {})).title = text
      }
    }

    function onopentag (name, attr) {
      debug('ONOPENTAG')

      let prop = attr.property || attr.name
      let val = attr.content || attr.value

      if (opts.oembed && attr.type === 'application/json+oembed') {
        unfurled.oembed = attr.href
        return
      }

      if (name !== 'meta') return

      if (opts.ogp && _.includes(ogp, prop)) {
        let target = (unfurled.ogp || (unfurled.ogp = {}))

        rollup(target, prop, val)

        return
      }

      if (opts.twitter && _.includes(twitter, prop)) {
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

    // parser.onclosetag =
    function onclosetag (tag) {
      if (tag === 'head') {
        debug('ABORTING')

        resolve(unfurled)

        req.abort() // Parse as little as possible.
        parser.end()
        parser.reset()

      }
    }

    req.on('data', (data) => parser.write(data))

    req.on('drain', () => {
      req.resume()
    })

    req.on('abort', () => {
    })

    req.on('end', () => {
      debug('REQ END')
      // parser.end()
      resolve(unfurled)
    })
  })
}
