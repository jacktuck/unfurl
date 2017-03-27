/*

let og = require('og-scraper')

Usage: og({url | data},options)

Examples:
og('https://google.com')

og('https://google.com',{
  fallback: false //defaults to true!
})



TODO
make sure html is returned,otherwise abort
abort after some reasonable byte limit
stop parsing after abort
*/


var _ = require('lodash')
var request = require('request')
var parser = require('sax').createStream(false,{
  lowercase: true
})

var ogProvider = [
  'og:title',
  'og:type',
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'og:image:width',
  'og:image:height',
  'og:image:type',
  'og:url',
  'og:audio',
  'og:audio:url',
  'og:audio:secure_url',
  'og:audio:type',
  'og:description',
  'og:determiner',
  'og:locale',
  'og:locale:alternate',
  'og:site_name',
  'og:video',
  'og:video:url',
  'og:video:secure_url',
  'og:video:width',
  'og:video:height',
  'og:video:type'
]

var twitProvider = [
  'twitter:card',
  'twitter:site',
  'twitter:site:id',
  'twitter:creator',
  'twitter:creator:id',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'twitter:image:height',
  'twitter:image:width',
  'twitter:image:alt',
  'twitter:player',
  'twitter:player:width',
  'twitter:player:height',
  'twitter:player:stream',
  'twitter:app:name:iphone',
  'twitter:app:id:iphone',
  'twitter:app:url:iphone',
  'twitter:app:name:ipad',
  'twitter:app:id:ipad',
  'twitter:app:url:ipad',
  'twitter:app:name:googleplay',
  'twitter:app:id:googleplay',
  'twitter:app:url:googleplay',
]

var providers = _.concat(ogProvider, twitProvider)

og('https://crugo.com')

function og (url,opts) {
  if (!_.isPlainObject(opts)) opts = {}

  opts = _.defaults(opts,{
    twitterCard: true
  })

  let o = {}

  parser.on('error',function (err) {
    console.error(err)

    this._parser.error = null
    this._parser.resume()
  })

  parser.ontext = function (t) {
    let tag = this._parser.tagName

    console.log('ontext',t)
    console.log('tag',tag)
  }

  parser.onopentag = function (n) {
    var name = n.name
    var attributes = n.attributes
    var ctx = (opts.twitterCard) ? providers : ogProvider


    if (name !== 'meta') return
    if (!_.includes(ctx, attributes.property)) return

    var prettyName = _.camelCase(attributes.property)

    o[prettyName] = attributes.content
  }

  parser.onclosetag = function (tag) {
    console.log('onclosetag',tag)

    if (tag === 'head') {
      console.log('ALERT')
      req.abort() //Parse as little as possible.
    }
  }

  var req = request('https://crugo.com',{
    headers: {
      'user-agent': 'facebookexternalhit' //Serve prerendered page for SPAs if we can.
    }
  })

  req.pipe(parser)

  parser.on('end',() => {
    console.log('SAX END')

    console.log('O', o)
  })

  req.on('end',() => {
    console.log('REQUEST END')
  })
}
