const parseUrl = require('url').parse
const resolveUrl = require('url').resolve

const get = require('lodash.get')
const set = require('lodash.set')
const camelCase = require('lodash.camelcase')

const iconv = require('iconv-lite')
const parseContentType = require('content-type').parse
const fetch = require('node-fetch')
const htmlparser2 = require('htmlparser2')

const standards = require('./standards')

const debug = require('debug')

function unfurl (src, opts) {
  let metadata = []
  opts = opts || {}

  opts = {
    fetch_oembed: get(opts, 'fetch_oembed', true), // support fetching oembed metadata https://oembed.com/#section2
    timeout: get(opts, 'timeout', 0), // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
    timeout_oembed: get(opts, 'timeout_oembed', opts.timeout),
    follow: get(opts, 'follow', 1), // maximum redirect count. 0 to not follow redirect
    follow_oembed: get(opts, 'follow_oembed', opts.follow),
    compress: get(opts, 'compress', true), // support gzip/deflate content encoding
    compress_oembed: get(opts, 'compress_oembed', opts.compress),
    size: get(opts, 'size', 0), // maximum response body size in bytes. 0 to disable
    size_oembed: get(opts, 'size_oembed', opts.size),
    agent: get(opts, 'agent', null), // http(s).Agent instance, allows custom proxy, certificate, lookup, family etc.
    agent_oembed: get(opts, 'agent_oembed', opts.agent)
  }

  const ctx = { src }

  return fetchUrl(src, opts)
    .then(res => new Promise((resolve, reject) => {
      const parser = new htmlparser2.Parser({}, {
        decodeEntities: true
      })

      const _reset = reset(res, parser)

      parser._cbs = {
        onopentag: onopentag(metadata, ctx, opts),
        ontext: ontext(metadata, ctx, opts),
        onclosetag: onclosetag(metadata, _reset),
        onend: onend(resolve, metadata),
        onreset: onreset(resolve, metadata),
        onerror: onerror(reject),
        onopentagname: onopentagname()
      }

      res.body.pipe(parser)
    }))
    .then(processOembed(ctx, opts))
}

// const encodings = [ 'CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP' ]

function fetchUrl (src, opts) {
  const log = debug('unfurl:fetchUrl')
  log('src', src)

  return fetch(src, {
    Accept: 'text/html',
    timeout: opts.timeout,
    follow: opts.follow,
    compress: opts.compress,
    size: opts.size,
    agent: opts.agent
  }).then(res => {
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

    return res
  })
}

function processOembed (ctx, opts) {
  return function (metadata) {
    console.log('got here', {metadata, ctx})

    console.log('ctx.oembed 1', ctx.oembed)

    if (!opts.fetch_oembed || !ctx.oembed) {
      return metadata
    }

    // convert relative url to an absolute one
    if (/^[a-z][a-z0-9+.-]*:/.test(ctx.oembed) === false) {
      ctx.oembed = resolveUrl(ctx.src, ctx.oembed)
    }

    console.log('ctx.oembed 2', ctx.oembed)

    return fetch(ctx.oembed, {
      Accept: 'application/json, text/javascript',
      timeout: opts.oembed_timeout,
      follow: opts.oembed_follow,
      compress: opts.oembed_compress,
      size: opts.oembed_size,
      agent: opts.oembed_agent
    }).then(res => {
      let { type: contentType } = parseContentType(res.headers.get('Content-Type'))

      if (contentType !== 'application/json' && contentType !== 'text/javascript') {
        const err = new Error(`Bad content type: expected application/json or text/javascript, but got ${contentType}`)
        err.code = 'ERR_BAD_CONTENT_TYPE'

        throw err
      }

      // JSON text SHALL be encoded in UTF-8, UTF-16, or UTF-32 https://tools.ietf.org/html/rfc7159#section-8.1
      return res.json()
    }).then(data => {
      const unwind = get(data, 'body', data, {})

      metadata.push(
        ...Object.entries(unwind).filter(([key]) => standards.includes(key)).map(arr => ['oembed', arr[0], arr[1]])
      )

      return metadata
    }).catch(err => {
      console.log('GOT AN ERROR', err)
      return metadata
    })
  }
}

function onend (resolve, metadata) {
  const log = debug('unfurl:onend')
  return function () {
    resolve(metadata)
  }
}

function onreset (resolve, metadata) {
  const log = debug('unfurl:onreset')

  return function () {
    resolve(metadata)
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

function ontext (metadata, ctx, opts) {
  const log = debug('unfurl:ontext')

  return function (text) {
    log('tag', this._tagname)
    log('text', text)

    if (this._tagname === 'title') {
      if (ctx.title === undefined) {
        ctx.title = ''
      }

      ctx.title += text
    }
  }
}

function onopentag (metadata, ctx, opts) {
  const log = debug('unfurl:onopentag')

  return function (name, attr) {
    log('name', name)
    log('attr', attr)

    console.log('OPTS', opts)
    if (opts.fetch_oembed && attr.type === 'application/json+oembed' && attr.href) {
      console.log('saving oembed url')
      ctx.oembed = attr.href
      return
    }

    const prop = attr.name || attr.rel
    const val = attr.content || attr.value || attr.href

    log('prop', prop)
    log('val', val)

    if (standards.includes(prop) === false) return
    if (!prop) return
    if (!val) return

    metadata.push([prop, val])
  }
}

function onclosetag (metadata, reset) {
  const log = debug('unfurl:onclosetag')

  return function (tag) {
    log(tag)

    this._tagname = ''

    if (tag === 'head') {
      reset()
    }

    if (tag === 'title') {
      metadata.push(['title', this._title])
    }
  }
}

function reset (res, parser) {
  const log = debug('unfurl:reset')

  return function () {
    parser.end()
    parser.reset() // resetting the parser to save cpu cycles and preempt redundant processing

    res.body.unpipe(parser)
    res.body.resume()

    if (typeof res.body.destroy === 'function') {
      res.body.destroy()
    }
  }
}

module.exports = unfurl
