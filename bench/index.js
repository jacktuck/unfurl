var unfurl = require('../')
var pify = require('pify')

var ogs = require('open-graph-scraper')
ogs = pify(ogs)

var debug = require('debug')('bench')

var glob = require('glob')
var microtime = require('microtime')
var _ = require('lodash')

let serve = require('serve')

// const dir = __dirname + '/../test/*.html'
// console.log('html dir', dir)

server = serve(__dirname + '/../test', {
  port: 8888
})

// let server = exec('./node_modules/.bin/http-server', ['-e', 'html'])

var files = []

console.log('cwd',  __dirname + '/../test')

glob.sync('*.html', {
  cwd: __dirname + '/../test',
}).forEach(function (file) {
  debug('file', file, '@', 'http://localhost:8888/' + file)
  files.push('http://localhost:8888/' + file)
})

files = _.flatten(Array(50).fill(files))

async function bench () {
  await delay(3000) // Wait for http server to warm up

  console.log('warmed...')

  let o = file => ogs({url: file})
  let u = file => unfurl(file, { oembed: false })

  // var [ min1, mean1, max1, rp1 ] = await runner(o)
  // debug('ogs')
  // debug('min', min1)
  // debug('mean', mean1)
  // debug('max', max1)
  // debug('rp', rp1)

  var [ min2, mean2, max2, rps2 ] = await runner(u)
  debug('unfurl')
  debug('min', min2)
  debug('mean', mean2)
  debug('max', max2)
  debug('rps', rps2)
}

bench()
  .then(() => server.stop('SIGHUP'))

// fn is a bound function
async function runner (fn) {
  let timing = []

  let elapsed = microtime.now()

  for (let file of files) {
    try {
      let sent = microtime.now()
      await fn(file) // Disable oembed otherwise unfurl would be making n^2 network requests
      let recv = microtime.now()
      let took = recv - sent

      timing.push(took)
    } catch (err) {
      debug('ERR', err)
    }
  }

  elapsed = microtime.now() - elapsed
  elapsed = elapsed * 1e-6
  let rps = files.length / elapsed

  let min = _.min(timing) / 1000
  let mean = _.mean(timing) / 1000
  let max = _.max(timing) / 1000

  return [ min, mean, max, rps ]
}

function delay (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}
