"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fields_1 = require("./fields");
console.log(111, fields_1.foo);
/*


class UnexpectedError extends Error {
  static WRONG_CONTENT_TYPE = {
    message: 'Wrong content type header when "text/html" was expected',
    name: 'ERR_WRONG_CONTENT_TYPE'
  }

  constructor(errorType: { message: string, name: string }) {
    super(errorType.message)

    this.name = errorType.name
    this.stack = new Error().stack
  }
}

function isRelativeUrl (url: string) {
  return /^[a-z][a-z0-9+.-]*:/.test(url) === false
}

unfurl('', {
  f
})

type Opts = {
  fetch_oembed?: boolean // support fetching remote oembed metadata
  timeout?: number // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
  timeout_oembed?: number // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
  follow?: number  // maximum redirect count. 0 to not follow redirect
  follow_oembed?: number // maximum redirect count. 0 to not follow redirect
  compress?: boolean // support gzip/deflate content encoding
  compress_oembed?: boolean // support gzip/deflate content encoding
  size?: number  // maximum response body size in bytes. 0 to disable
  size_oembed?: number  // maximum response body size in bytes. 0 to disable
  agent?: string | null // http(s).Agent instance, allows custom proxy, certificate, lookup, family etc.
  agent_oembed?: string | null // http(s).Agent instance, allows custom proxy, certificate, lookup, family etc.
}

function unfurl (url: string, opts?: Opts) {
  opts = {
    fetch_oembed: opts.fetch_oembed !== undefined ? opts.fetch_oembed : true,
    timeout: opts.timeout !== undefined ? opts.timeout : 0,
    timeout_oembed: opts.timeout_oembed !== undefined ? opts.timeout_oembed : 0,
    compress: opts.compress !== undefined ? opts.compress : true,
    compress_oembed: opts.compress_oembed !== undefined ? opts.compress_oembed : true,
    size: opts.size !== undefined ? opts.size : 0,
    size_oembed: opts.size_oembed !== undefined ? opts.size_oembed : 0,
    agent: opts.agent !== undefined ? opts.agent : null,
    agent_oembed: opts.agent_oembed !== undefined ? opts.agent_oembed : null,
  }

  const metadata: Array<string[]> = []

  const ctx: {
    url?: string,
    oembed?: string
  } = {
    url
  }

  return getPage(url, opts)
    .then(getLocalMetadata(metadata, ctx, opts))
    .then(getRemoteMetadata(metadata, ctx, opts))
}

function getPage (url: string, opts: Opts) {
  const log = debug('unfurl:getPage')
  log('url', url)

  return fetch(url, {
    headers: {
      Accept: 'text/html, application/xhtml+xml',
      agent: opts.agent
    },
    timeout: opts.timeout,
    follow: opts.follow,
    compress: opts.compress,
    size: opts.size,
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

    let { type: contentType, parameters: { charset } } = parse_content_type(res.headers.get('Content-Type'))

    if (charset) {
      charset = charset.toUpperCase()
    }

    let contentLength: number = parseInt(res.headers.get('Content-Length') || '0')
    
    if (contentType !== 'text/html') {
      throw new UnexpectedError(UnexpectedError.WRONG_CONTENT_TYPE)
    }

    return res
  })
}

function getLocalMetadata (metadata, ctx, opts: Opts) {
  return function (res) {
    return new Promise((resolve, reject) => {
      const parser = new Parser({}, {
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
    })
  }
}

// const encodings = [ 'CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP' ]


function getRemoteMetadata (metadata, ctx, opts: Opts) : () => Array<string[]> {
  return function () {
    console.log('got here', {metadata, ctx})

    console.log('ctx.oembed 1', ctx.oembed)

    if (!opts.fetch_oembed || !ctx.oembed) {
      return metadata
    }

    // convert relative url to an absolute one
    if (isRelativeUrl(ctx.oembed)) {
      ctx.oembed = resolveUrl(ctx.url, ctx.oembed)
    }

    console.log('ctx.oembed 2', ctx.oembed)

    return fetch(ctx.oembed, {
      headers: {
        Accept: 'application/json, text/javascript',
        agent: opts.agent_oembed
      },
      timeout: opts.timeout_oembed,
      follow: opts.follow_oembed,
      compress: opts.compress_oembed,
      size: opts.size_oembed
    }).then(res => {
      let { type: contentType } = parse_content_type(res.headers.get('Content-Type'))

      if (contentType !== 'application/json' && contentType !== 'text/javascript') {
        const err = new Error(`Bad content type: expected application/json or text/javascript, but got ${contentType}`)
        err.code = 'ERR_BAD_CONTENT_TYPE'

        throw err
      }

      // JSON text SHALL be encoded in UTF-8, UTF-16, or UTF-32 https://tools.ietf.org/html/rfc7159#section-8.1
      return res.json()
    }).then(data => {
      const unwind = data.body || {} // get(data, 'body', data, {})

      metadata.push(
        ...Object.entries(unwind)
          .filter(([key]) => fields.includes(key))
          .map(arr => ['oembed', arr[0], arr[1]])
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

function ontext (metadata, ctx, opts: Opts) {
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

function onopentag (metadata, ctx, opts: Opts) {
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

    if (fields.includes(prop) === false) return
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
*/ 
