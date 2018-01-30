const get = require('lodash.get')
const set  = require('lodash.set')
const camelCase = require('lodash.camelcase')

const fetch = require('node-fetch')
const htmlparser2 = require('htmlparser2')

const ogp = require('./lib/ogp')
const twitter = require('./lib/twitter')
const oembed = require('./lib/oembed')

const debug = require('debug')('unfurl')

const shouldRollup = [
  'og:image',
  'twitter:image',
  'twitter:player',
  'og:video',
  'og:audio'
]

async function unfurl (url, init = {}) {
  const pkgOpts = {
    ogp: get(init, 'ogp', true),
    twitter: get(init, 'twitter', true),
    oembed: get(init, 'oembed', true),
    other: get(init, 'other', true)
  }

  const fetchOpts = {
    timeout: get(init, 'timeout', 2000),
    follow: get(init, 'follow', 5),
    compress: get(init, 'compress', true)
  }

  let metadata = await scrape(url, pkgOpts, fetchOpts)
    .then(postProcess)

  if (pkgOpts.oembed && metadata.oembed) {
    let oembedData = await fetch(metadata.oembed, fetchOpts)
      .then(res => res.json())


    const unwind = get(oembedData, 'body', oembedData)

    // Even if we don't find valid oembed data we'll return an obj rather than the url string
    metadata.oembed = {}

    for (const [k, v] of Object.entries(unwind)) {
      const camelKey = camelCase(k)
      if (!oembed.includes(camelKey)) {
        continue
      }


      metadata.oembed[camelKey] = v
    }
  }

  return metadata
}

async function scrape (url, pkgOpts, fetchOpts) {
  let pkg = Object.create(null)

  return new Promise(async (resolve, reject) => {
    let parserStream = new htmlparser2.WritableStream({
      onopentag,
      ontext,
      onclosetag,
      onerror,
      onopentagname
    }, {decodeEntities: true})

    let res = await fetch(url, fetchOpts)
      .then(res => res.body)

    res.pipe(parserStream)
  
    function onopentagname (tag) {
      debug('<' + tag + '>')

      this._tagname = tag
    }

    function onerror (err) {
      debug('error', err)
      reject(err)
    }

    function ontext (text) {
      if (this._tagname === 'title' && pkgOpts.other) {
        set(pkg, 'other.title', get(pkg, 'other.title', '') + text)
      }
    }

    function onopentag (name, attr) {
      let prop = attr.property || attr.name || attr.rel
      let val = attr.content || attr.value || attr.href

      if (!prop) return

      debug(prop + '=' + val)

      if (pkgOpts.oembed && attr.type === 'application/json+oembed') {
        pkg.oembed = attr.href
        return
      }

      if (!val) return

      let target

      if (pkgOpts.ogp && ogp.includes(prop)) {
        target = (pkg.ogp || (pkg.ogp = {}))
      } else if (pkgOpts.twitter && twitter.includes(prop)) {
        target = (pkg.twitter || (pkg.twitter = {}))
      } else {
        target = (pkg.other || (pkg.other = {}))
      }

      rollup(target, prop, val)
    }

    function onclosetag (tag) {
      debug('</' + tag + '>')

      this._tagname = ''
  
      if (tag === 'head') {
        res.unpipe(parserStream)
        parserStream.destroy()
        res.destroy()
        parserStream._parser.reset() // Parse as little as possible.
      }
    }

    res.on('response', function ({ headers }) {
      let contentType = get(headers, 'content-type', '')

      // Abort if content type is not text/html or varient
      if (!contentType.includes('html')) {
        res.unpipe(parserStream)
        parserStream.destroy()
        res.destroy()
        parserStream._parser.reset() // Parse as little as possible.
        set(pkg, 'other._type', contentType)
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

  let rollupAs = shouldRollup.find(function (k) {
    return name.startsWith(k)
  })

  if (rollupAs) {
    let namePart = name.slice(rollupAs.length)
    let prop = !namePart ? 'url' : camelCase(namePart)
    rollupAs = camelCase(rollupAs)

    target = (target[rollupAs] || (target[rollupAs] = [{}]))

    let last = target[target.length - 1]
    last = (last[prop] ? (target.push({}) && target[target.length - 1]) : last)
    last[prop] = val

    return
  }

  let prop = camelCase(name)
  target[prop] = val
}

function postProcess (obj) {

  let keys = [
    'ogp.ogImage',
    'twitter.twitterImage',
    'twitter.twitterPlayer',
    'ogp.ogVideo'
  ]

  for (const key of keys) {
    let val = get(obj, key)
    if (!val) continue
    
    val = val.sort((a, b) => a.width - b.width) // asc sort

    set(obj, key, val)
  }

  return obj
}

module.exports = unfurl
