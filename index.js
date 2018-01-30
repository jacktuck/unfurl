let _ = require('lodash')
let fetch = require('node-fetch')
let htmlparser2 = require('htmlparser2')

let ogp = require('./lib/ogp')
let twitter = require('./lib/twitter')
let oembed = require('./lib/oembed')

let debug = require('debug')('unfurl')

let shouldRollup = [
  'og:image',
  'twitter:image',
  'twitter:player',
  'og:video',
  'og:audio'
]

async function unfurl (url, opts) {
  opts = _.defaults(opts || Object.create(null), {
    ogp: true,
    twitter: true,
    oembed: true,
    other: true
  })

  let metadata = await scrape(url, opts)
    .then(postProcess)

  if (opts.oembed && metadata.oembed) {
    let oembedData = await fetch(metadata.oembed, { compress:true })
      .then(res => res.json())

    metadata.oembed = _(_.get(oembedData, 'body'))
      .pickBy((v, k) => _.includes(oembed, k))
      .mapKeys((v, k) => _.camelCase(k))
      .value()
  }

  return metadata
}

async function scrape (url, opts) {
  let pkg = Object.create(null)

  return new Promise(async (resolve, reject) => {
    let parserStream = new htmlparser2.WritableStream({
      onopentag,
      ontext,
      onclosetag,
      onerror,
      onopentagname
    }, {decodeEntities: true})

    let res = await fetch(url, { compress:true })
      .then(res => res.body)

    res.pipe(parserStream)
  
    function onopentagname (tag) {
      this._tagname = tag
    }

    function onerror (err) {
      debug('error', err)
      reject(err)
    }

    function ontext (text) {
      if (this._tagname === 'title' && opts.other) {
        _.set(pkg, 'other.title', _.get(pkg, 'other.title', '') + text)
      }
    }

    function onopentag (name, attr) {
      let prop = attr.property || attr.name || attr.rel
      let val = attr.content || attr.value || attr.href

      if (opts.oembed && attr.type === 'application/json+oembed') {
        pkg.oembed = attr.href
        return
      }

      let target

      if (opts.ogp && _.includes(ogp, prop)) {
        target = (pkg.ogp || (pkg.ogp = {}))
      } else if (opts.twitter && _.includes(twitter, prop)) {
        target = (pkg.twitter || (pkg.twitter = {}))
      } else {
        target = (pkg.other || (pkg.other = {}))
      }

      rollup(target, prop, val)
    }

    function onclosetag (tag) {
      this._tagname = ''
      debug('tag', tag)
      if (tag === 'head') {
        res.unpipe(parserStream)
        parserStream.destroy()
        res.destroy()
        parserStream._parser.reset() // Parse as little as possible.
      }
    }

    res.on('response', function ({ headers }) {
      let contentType = _.get(headers, 'content-type', '')

      // Abort if content type is not text/html or varient
      if (!_.includes(contentType, 'html')) {
        res.unpipe(parserStream)
        parserStream.destroy()
        res.destroy()
        parserStream._parser.reset() // Parse as little as possible.
        _.set(pkg, 'other._type', contentType)
      }
    })

    res.on('end', () => {
      debug('parsed')
      resolve(pkg)
    })

    res.on('error', (err) => {
      debug('parse error', err.message)
      reject(err)
    })
  })
}

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
    last[prop] = val

    return
  }

  let prop = _.camelCase(name)
  target[prop] = val
}

function postProcess (obj) {
  let keys = [
    'ogp.ogImage',
    'twitter.twitterImage',
    'twitter.twitterPlayer',
    'ogp.ogVideo'
  ]

  return _.each(keys, key => {
    let val = _.get(obj, key)

    if (!val) return

    val = _.orderBy(val, 'width', 'asc')

    return _.set(obj, key, val)
  }) && obj
}

module.exports = unfurl
