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
var parser = require('sax').parser(false,{
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

function og (url, callback, opts) {
  opts = _.defaults(opts || {} ,{
    twitterCard: true
  })

  let o = {}

  parser.onerror = function (e) {
    callback(e)
  };

  parser.ontext = function (t) {
    // let tag = this._parser.tagName
    // console.log('tag',tag)
  }

  parser.onopentag = function (n) {
    var name = n.name
    var attributes = n.attributes
    var ctx = (opts.twitterCard) ? providers : ogProvider
    console.log('onopentag',name, Date.now())


    if (name !== 'meta') return
    if (!_.includes(ctx, attributes.property)) return

    var prettyName = _.camelCase(attributes.property)

    o[prettyName] = attributes.content
  }

  parser.onclosetag = function (tag) {
    // console.log('onclosetag',tag, Date.now())

    if (tag === 'head') {
      // console.log('ALERT')
      callback(null, o)
      req.abort() //Parse as little as possible.

    }
  }

  var req = request(url, {
    headers: {
      'user-agent': 'facebookexternalhit' //Serve prerendered page for SPAs if we can.
    }
  })

  req.on('abort',() => {
    // console.log('aborted')
  })

  req.on('end',() => {
    // console.log('REQUEST END')
  })

  req.on('data',(data) => {
    console.log('REQUEST DATA')
    parser.write(data)
    parser.flush()
  })
}

console.time('og')
og('https://www.crugo.com', (err, result) => {
  console.log('foo')
  console.log(err, result)
  console.timeEnd('og')
})



//
//
// var openGraphScraper = require('open-graph-scraper');
// console.time('openGraphScraper')
// openGraphScraper({url: 'http://www.bbc.co.uk/news'}, function (err, result) {
//   console.timeEnd('openGraphScraper')
// });
