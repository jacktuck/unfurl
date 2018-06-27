const get = require('lodash.get')
const set = require('lodash.set')
const camelCase = require('lodash.camelcase')

const iconv = require('iconv-lite')
const contentType = require('content-type')
const fetch = require('node-fetch')
const htmlparser2 = require('htmlparser2')

const ogp = require('./lib/ogp')
const twitter = require('./lib/twitter')
const oembed = require('./lib/oembed')

const debug = require('debug')

const shouldRollup = [
  'og:image',
  'twitter:image',
  'twitter:player',
  'og:video',
  'og:audio'
]

function unfurl (url, init) {
  init = init || {}

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

  return handleUrl(url, fetchOpts)
    .then(handleStream(pkgOpts))
    .then(postProcess(pkgOpts))
}

function handleUrl (url, fetchOpts) {
  const log = debug('unfurl:handleUrl')

  return fetch(url, fetchOpts).then(res => {
    res.body.once('error', (err) => {
      log('got error', err.message)

      process.nextTick(function () {
        throw err
      })
    })

    const contentTypeHeader = res.headers.get('Content-Type')
    const { type: mediaType, parameters: { charset } } = contentType.parse(contentTypeHeader)

    log('mediaType', mediaType)
    log('charset', charset)

    if (mediaType !== 'text/html') {
      throw new Error('content-type must be text/html')
    }

    const multibyteEncodings = [
      'CP932',
      'CP936',
      'CP949',
      'CP950',
      'GB2312',
      'GBK',
      'GB18030',
      'Big5',
      'Shift_JIS',
      'EUC-JP'
    ]

    if (multibyteEncodings.includes(charset)) {
      log('converting multibyte encoding')

      res.body = res.body
        .pipe(iconv.decodeStream(charset))
        .pipe(iconv.encodeStream('utf-8'))
    }

    return res
  })
}

function onend (resolve, pkg) {
  const log = debug('unfurl:onend')
  return function () {
    log('hit')
    resolve(pkg)
  }
}

function onreset (resolve, pkg) {
  const log = debug('unfurl:onreset')

  return function () {
    log('hit')
    resolve(pkg)
  }
}

function onerror (reject) {
  const log = debug('unfurl:onerror')

  return function (err) {
    log(err)
    reject(err)
  }
}

function onopentagname () {
  const log = debug('unfurl:onopentagname')

  return function (tag) {
    log(tag)
    this._tagname = tag
  }
}

function ontext (pkg, pkgOpts) {
  const log = debug('unfurl:ontext')

  return function (text) {
    log('tag', this._tagname)
    log('text', text)
    log('current title', get(pkg, 'other.title', ''))
    if (this._tagname === 'title' && pkgOpts.other) {
      set(pkg, 'other.title', get(pkg, 'other.title', '') + text)
      log('new title', get(pkg, 'other.title', ''))
    }
  }
}

function onopentag (pkg, pkgOpts) {
  const log = debug('unfurl:onopentag')

  return function (name, attr) {
    log('name', name)
    log('attr', attr)

    const prop = attr.property || attr.name || attr.rel
    const val = attr.content || attr.value || attr.href

    log('prop', prop)
    log('val', val)

    if (!prop) return

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
}

function onclosetag (res, reset) {
  const log = debug('unfurl:onclosetag')

  return function (tag) {
    log(tag)

    this._tagname = ''

    if (tag === 'head') {
      reset()
    }
  }
}

function handleStream (pkgOpts) {
  return res => new Promise((resolve, reject) => {
    const pkg = {}

    const parser = new htmlparser2.Parser({
      onopentag: onopentag(pkg, pkgOpts),
      ontext: ontext(pkg, pkgOpts),
      onclosetag: onclosetag(res, reset()),
      onend: onend(resolve, pkg),
      onreset: onreset(resolve, pkg),
      onerror: onerror(reject),
      onopentagname: onopentagname()
    }, {
      decodeEntities: true
    })

    function reset () {
      const log = debug('unfurl:reset')

      return function () {
        log('hit')

        parser.end()
        parser.reset() // Parse as little as possible.

        res.body.unpipe(parser)
        res.body.resume()

        if (typeof res.body.destroy === 'function') {
          res.body.destroy()
        }
      }
    }

    res.body.pipe(parser)
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

  const prop = camelCase(name)
  target[prop] = val
}

function postProcess (pkgOpts) {
  return function (pkg) {
    const keys = [
      'ogp.ogImage',
      'twitter.twitterImage',
      'twitter.twitterPlayer',
      'ogp.ogVideo'
    ]

    for (const key of keys) {
      let val = get(pkg, key)
      if (!val) continue

      val = val.sort((a, b) => a.width - b.width) // asc sort

      set(pkg, key, val)
    }

    if (pkgOpts.oembed && pkg.oembed) {
      return fetch(pkg.oembed)
        .then(res => res.json())
        .then(oembedData => {
          const unwind = get(oembedData, 'body', oembedData, {})

          pkg.oembed = Object.entries(unwind)
            .filter(([key]) => oembed.includes(key))
            .reduce((obj, [key, value]) => Object.assign(obj, {
              [camelCase(key)]: value
            }), {})

          return pkg
        })
    }

    return pkg
  }
}

module.exports = unfurl
