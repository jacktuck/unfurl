import {
  parse as parseUrl,
  resolve as resolveUrl
} from 'url'

import { parse as parse_content_type } from 'content-type'
import { Parser } from 'htmlparser2'

// import iconv from 'iconv-lite'
import fetch from 'node-fetch'
import debug from 'debug'

import UnexpectedError from './UnexpectedError'
import schema from './schema'
const keys = Array.from(schema.keys())

function isRelativeUrl (url: string): boolean {
  return /^(http|\/\/)/.test(url) === false
}

type Opts = {
  /** support retreiving oembed metadata */
  fetch_oembed?: boolean
  /** req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies) */
  timeout?: number
  /** maximum redirect count. 0 to not follow redirect */
  follow?: number 
  /** support gzip/deflate content encoding */
  compress?: boolean
  /** maximum response body size in bytes. 0 to disable */
  size?: number
  /** http(s).Agent instance, allows custom proxy, certificate, lookup, family etc. */
  agent?: string | null
}

unfurl('https://www.theguardian.com/business/2018/sep/07/ba-british-airways-chief-alex-cruz-compensate-customers-after-data-breach')
unfurl('https://www.bbc.co.uk/news/entertainment-arts-45444998')
function unfurl (url: string, opts?: Opts) {
  if (opts === undefined || opts.constructor.name !== 'Object') {
    opts = {}
  }

  // Setting defaults when not provided or not correct type
  typeof opts.fetch_oembed === 'boolean' || (opts.fetch_oembed = true)
  typeof opts.compress === 'boolean' || (opts.compress = true)
  typeof opts.agent === 'string' || (opts.agent = null)

  Number.isInteger(opts.timeout) || (opts.timeout = 0)
  Number.isInteger(opts.size) || (opts.size = 0)

  const metadata = new Map()

  const ctx: {
    url?: string,
    oembed?: string
  } = {
    url
  }

  return getPage(url, opts)
    .then(getLocalMetadata(ctx, opts))
    .then(getRemoteMetadata(ctx, opts))
    .then(parse)
}

function getPage (url: string, opts: Opts) {
  const log = debug('unfurl:getPage')
  console.log('url', url)

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
    let { type: contentType, parameters: { charset } } = parse_content_type(res.headers.get('Content-Type'))

    if (charset) {
      charset = charset.toUpperCase()
    }

    let contentLength: number = parseInt(res.headers.get('Content-Length') || '0')
    
    if (contentType !== 'text/html' && contentType !== 'application/xhtml+xml') {
      throw new UnexpectedError(UnexpectedError.EXPECTED_HTML)
    }

    return res.text()
      .catch(err => {
        console.log('error', err.message)

        if (err.code === 'Z_BUF_ERROR') {
          return
        }
  
        process.nextTick(function () {
          throw err
        })
      })
  })
}

function getLocalMetadata (ctx, opts: Opts) {
  return function (text) {
    const metadata = new Map()

    return new Promise((resolve, reject) => {
      const parser = new Parser({}, {
        decodeEntities: true
      })

      function onend () {
        resolve(metadata)
      }
      
      function onreset () {
        resolve(metadata)
      }
      
      function onerror (err) {
        reject(err)
      }
      
      function onopentagname  (tag) {
        this._tagname = tag
      }
      
      function ontext (text) {   
        if (this._tagname === 'title') {
          if (ctx.title === undefined) {
            ctx.title = ''
          }
    
          ctx.title += text
        }
      }
      
      function onopentag (name, attr) {  
        if (opts.fetch_oembed && attr.type === 'application/json+oembed' && attr.href) {
          ctx.oembed = attr.href
          return
        }
    
        const prop = attr.name || attr.rel
        const val = attr.content || attr.value
    
        if (
          !prop ||
          !val ||
          keys.includes(prop) === false
        ) {
          return
        }
    
        metadata.set(prop, val)
      }
      
      function onclosetag (tag) {   
        this._tagname = ''
  
        if (tag === 'head') {
          parser.reset()
        }
    
        if (tag === 'title') {
          metadata.set('title', ctx.title)
        }
      }

      parser._cbs = {
        onopentag,
        ontext,
        onclosetag,
        onend,
        onreset,
        onerror,
        onopentagname
      }

      parser.write(text)
      parser.end()
    })
  }
}

// const encodings = [ 'CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP' ]


function getRemoteMetadata (ctx, opts: Opts) {
  return function (metadata) {
    if (!opts.fetch_oembed || !ctx.oembed) {
      return metadata
    }

    // convert relative url to an absolute one
    if (isRelativeUrl(ctx.oembed)) {
      ctx.oembed = resolveUrl(ctx.url, ctx.oembed)
    }

    return fetch(ctx.oembed).then(res => {
      let { type: contentType } = parse_content_type(res.headers.get('Content-Type'))

      if (contentType !== 'application/json') {
        throw new UnexpectedError(UnexpectedError.EXPECTED_JSON)
      }

      // JSON text SHALL be encoded in UTF-8, UTF-16, or UTF-32 https://tools.ietf.org/html/rfc7159#section-8.1
      return res.json()
    }).then(data => {
      const unwind = data.body || {} // get(data, 'body', data, {})

      metadata.set(
        ...Object.entries(unwind)
          .filter(([key]) => keys.includes(key))
          .map(arr => ['oembed', arr[0], arr[1]])
      )

      return metadata
    }).catch(err => {
      return metadata
    })
  }
}

function parse (metadata) {
  const parsed = {
    twitter_cards: []
  }

  for (const [metaKey, metaValue] of metadata) {
    const item = schema.get(metaKey)

    if (!item) {
      parsed[metaKey] = metaValue
      continue
    }

    let target = parsed[item.entry]
    
    if (Array.isArray(target)) {
      if (!target[target.length - 1]) {
        target.push({})
      }

      target = target[target.length - 1]
    }

    // Trap for deep properties like { twitter_cards: [{ images: { url: '' } }] }, where images is our target rather than the card's root.
    if (item.parent) {
      if (Array.isArray(target[item.parent]) === false) {
        target[item.parent] = []
      }

      if (!target[item.parent][target[item.parent].length - 1]) {
        target[item.parent].push({})
      }

      target = target[item.parent][target[item.parent].length - 1]
    }

    if (item.category) {
      target['category'] = item.category
    }
    

    // some fields map to the same name so once we have one stick with it
    target[item.name] || (target[item.name] = metaValue)
  }

  console.log('PARSED', '\n', JSON.stringify(parsed, null, 2))
}

export default unfurl