const parseUrl = require('url').parse
const resolveUrl = require('url').resolve

const get = require('lodash.get')
const set = require('lodash.set')
const camelCase = require('lodash.camelcase')

const iconv = require('iconv-lite')
const parseContentType = require('content-type').parse
const fetch = require('node-fetch')
const htmlparser2 = require('htmlparser2')

const ogp = require('./lib/ogp')
const twitter = require('./lib/twitter')
const oembed = require('./lib/oembed')

const debug = require('debug')

const zippedKeys = [
  'og:image',
  'twitter:image',
  'twitter:player',
  'og:video',
  'og:audio'
]

const sortedKeys = [
  'ogp.ogImage',
  'twitter.twitterImage',
  'twitter.twitterPlayer',
  'ogp.ogVideo'
]

function unfurl (initialUrl, init) {
  init = init || {}

  const pkgOpts = {
    ogp: get(init, 'ogp', true),
    twitter: get(init, 'twitter', true),
    oembed: get(init, 'oembed', true),
    other: get(init, 'other', true)
  }

  const fetchOpts = {
    timeout: get(init, 'timeout', 0), // OS limit applies
    follow: get(init, 'follow', 5),
    compress: get(init, 'compress', true)
  }

  return fetchUrl(initialUrl, fetchOpts)
    .then(handleStream(pkgOpts))
    .then(postProcess(initialUrl, pkgOpts))
}

function fetchUrl (initialUrl, fetchOpts) {
  const log = debug('unfurl:fetchUrl')

  log('initialUrl', initialUrl)
  return fetch(initialUrl, fetchOpts).then(res => {
    res.body.once('error', (err) => {
      log('error', err.message)

      if (err.code === 'Z_BUF_ERROR') {
        return
      }

      process.nextTick(function () {
        throw err
      })
    })

    let { type: contentType, parameters: { charset } } = parseContentType(res.headers.get('Content-Type'))

    if (charset) {
      charset = charset.toUpperCase()
    }

    let contentLength = res.headers.get('Content-Length')
    if (contentLength) {
      contentLength = parseInt(contentLength)
    }

    log('charset', charset)
    log('contentType', contentType)
    log('contentLength', contentLength)

    if (!contentType) {
      const err = new Error('Bad content type: expected text/html, but could not parse the header')
      err.code = 'ERR_BAD_CONTENT_TYPE'
      err.metadata = { contentType, contentLength }

      throw err
    }

    if (contentType !== 'text/html') {
      const err = new Error(`Bad content type: expected text/html, but got ${contentType}`)
      err.code = 'ERR_BAD_CONTENT_TYPE'
      err.metadata = { contentType, contentLength }

      throw err
    }

    const pkg = {
      other: {
        contentType,
        contentLength
      }
    }

    const multibyteEncodings = [ 'CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP' ]

    if (multibyteEncodings.includes(charset)) {
      log('converting multibyte encoding from', charset, 'to utf-8')

      res.body = res.body
        .pipe(iconv.decodeStream(charset))
        .pipe(iconv.encodeStream('utf-8'))
    }

    return [pkg, res]
  })
}

function onend (resolve, pkg) {
  const log = debug('unfurl:onend')
  return function () {
    resolve(pkg)
  }
}

function onreset (resolve, pkg) {
  const log = debug('unfurl:onreset')

  return function () {
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

    if (this._tagname === 'title' && pkgOpts.other) {
      set(pkg, 'other.title', get(pkg, 'other.title', '') + text)
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

    // we only care about oembed json, if only xml is provided we won't look it up
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

    zipup(target, prop, val)
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

function reset (res, parser) {
  const log = debug('unfurl:reset')

  return function () {
    parser.end()
    parser.reset() // Parse as little as possible.

    res.body.unpipe(parser)
    res.body.resume()

    if (typeof res.body.destroy === 'function') {
      res.body.destroy()
    }
  }
}

function handleStream (pkgOpts) {
  return ([pkg, res]) => new Promise((resolve, reject) => {
    const parser = new htmlparser2.Parser({}, {
      decodeEntities: true
    })

    const _reset = reset(res, parser)

    parser._cbs = {
      onopentag: onopentag(pkg, pkgOpts),
      ontext: ontext(pkg, pkgOpts),
      onclosetag: onclosetag(res, _reset),
      onend: onend(resolve, pkg),
      onreset: onreset(resolve, pkg),
      onerror: onerror(reject),
      onopentagname: onopentagname()
    }

    res.body.pipe(parser)
  })
}

function zipup (target, name, val) {
  if (!name || !val) return

  name = camelCase(name)

  let zipupAs = zippedKeys
    .map(camelCase)
    .find(key => name.startsWith(key))

  // not a zipped key
  if (!zipupAs) {
    target[name] = val
    return
  }

  const namePart = camelCase(name.slice(zipupAs.length)) || 'url'

  if (!target[zipupAs]) {
    target[zipupAs] = [{}]
  }

  let zipTarget = target[zipupAs]

  let last = zipTarget[zipTarget.length - 1]

  if (last[namePart]) {
    zipTarget.push({})
    last = zipTarget[zipTarget.length - 1]
  }

  last[namePart] = val
}

function postProcess (initialUrl, pkgOpts) {
  return function (pkg) {
    for (const key of sortedKeys) {
      let val = get(pkg, key)
      if (!val) continue

      val = val.sort((a, b) => a.width - b.width) // asc sort

      set(pkg, key, val)
    }

    if (pkgOpts.oembed && pkg.oembed) {
      let oembedUrl = pkg.oembed
      console.log('oembedUrl 1', oembedUrl)
      // detects relative urls
      if (!parseUrl(pkg.oembed).host) {
        oembedUrl = resolveUrl(initialUrl, pkg.oembed)
      }
      console.log('oembedUrl 2', oembedUrl)

      return fetch(oembedUrl)
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
        .catch(err => {
          console.log('GOT AN ERROR', err)
          pkg.oembed = null
          return pkg
        })
    }

    return pkg
  }
}

module.exports = unfurl
