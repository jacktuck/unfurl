let _ = require('lodash')
let pify = require('pify')
let request = require('request')
let promisedRequest = pify(request)
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
    let oembedData = await fetch({
      url: metadata.oembed,
      json: true
    }, true)

    if (_.get(oembedData, 'body')) {
      metadata.oembed = _(oembedData.body)
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
  if (!_.isPlainObject(url)) url = { url }

  let r = promisify ? promisedRequest : request

  let params = _.merge(url, {
    headers: {
      'user-agent': 'facebookexternalhit'
    }
  })

  return r.get(params)
}

async function scrape (url, opts) {
  let pkg = Object.create(null)

  return new Promise((resolve, reject) => {
    let parserStream = new htmlparser2.WritableStream({
      onopentag,
      ontext,
      onclosetag,
      onerror,
      onopentagname
    }, {decodeEntities: true})

    let req = fetch(url)

    function onopentagname (tag) {
      this._tagname = tag
    }

    function onerror (err) {
      debug('error', err)
      reject(err)
    }

    function ontext (text) {
      if (this._tagname === 'title' && opts.other) {
        let other = (pkg.other || (pkg.other = {}))
        other.title = (other.title || '') + text
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
      } else if (opts.other) {
        target = (pkg.other || (pkg.other = {}))
      }

      rollup(target, prop, val)
    }

    function onclosetag (tag) {
      if (tag === 'head') {
        req.abort() // Parse as little as possible.
      }
    }

    req.on('response', function ({ headers }) {
      let validContentTypes = [
        'text/html',
        'application/xhtml+xml'
      ]

      let contentType = (headers['content-type'] || '').split(/;|;\s/)

      if (contentType[0].includes('video')) {
        _.set(pkg, 'other._type', 'video')
      }

      if (contentType[0].includes('image')) {
        _.set(pkg, 'other._type', 'image')
      }

      if (contentType[0].includes('audio')) {
        _.set(pkg, 'other._type', 'audio')
      }

      if (_.intersection(validContentTypes, contentType).length === 0) {
        req.abort()
      }
    })

    req.pipe(parserStream)

    req.on('abort', () => {
      debug('request aborted')
      parserStream._parser.reset()
    })

    req.on('end', () => {
      debug('request ended')
      resolve(pkg)
      parserStream._parser.end()
    })

    req.on('error', (err) => {
      debug('request failed', err.message)
      reject(err)
      parserStream._parser.end()
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
