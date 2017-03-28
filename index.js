var sax = require('sax')
var _ = require('lodash')
var request = require('request')

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

var tcProvider = [
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
  'twitter:app:url:googleplay'
]

let fallbacks = {}

var providers = _.concat(ogProvider, tcProvider)

module.exports = (url, callback, opts) => {
  var parser = sax.parser(false, {
    lowercase: true
  })

  callback = _.once(callback)

  opts = _.defaults(opts || {}, {
    twitterCard: true,
    title: true,
    metaDescription: true
  })

  console.log('opts.twitterCard', opts.twitterCard)

  var o = {}

  var req = request.get({
    url,
    // gzip: true,
    headers: {
      'user-agent': 'facebookexternalhit' //Serve prerendered page for SPAs if we can.
    }
  })

  parser.onerror = function (err) {
    callback(err)
  };

  parser.ontext = function (text) {
    var tag = parser.tagName
    console.log('tag',tag)
    console.log('text',text)

    if (tag === 'title') fallbacks.title = text
  }

  parser.onopentag = function (n) {
    var name = n.name
    var attributes = n.attributes
    var ctx = (opts.twitterCard) ? providers : ogProvider
    // console.log('onopentag',name, Date.now())

    console.log('attributes', attributes)

    let predicate = attributes.property || attributes.name

    if (name !== 'meta') return
    if (!_.includes(ctx, predicate)) return

    var prettyName = _.camelCase(predicate)

    o[prettyName] = attributes.content
  }

  parser.onclosetag = function (tag) {
    // console.log('onclosetag',tag)

    if (tag === 'head') {
      // console.log('ABORTING')
      callback(null, o)
      req.abort() //Parse as little as possible.
      console.log('fallbacks', fallbacks)
    }
  }

  req.on('data',(data) => {
    if (false === parser.write(data)) req.pause()
    else parser.flush()
  })

  req.on('drain', () => {
    console.log('REQUEST DRAIN')
    req.resume()
  })

  req.on('abort',() => {
    // console.log('REQUEST ABORT')
  })

  req.on('end',() => {
    // console.log('REQUEST END')
    callback(null, o)
  })
}
