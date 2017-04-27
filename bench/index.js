var unfurl = require('../')
var pify = require('pify')

var ogs = require('open-graph-scraper')
ogs = pify(ogs)

var debug = require('debug')('bench')

var glob = require('glob')
var microtime = require('microtime')
var _ = require('lodash')

var exec = require('child_process').exec

let server = exec('./node_modules/.bin/http-server', ['-e', 'html'])

var files = []

glob.sync('bench/html/*').forEach(function (file) {
  debug('file', file)
  files.push('http://localhost:8080/' + file)
})

files = _.flatten(Array(50).fill(files))

async function bench () {
  await delay(3000) // Wait for http server to warm up

  let o = file => ogs({url: file})
  let u = file => unfurl(file, { oembed: false })

  var [ min1, mean1, max1, rp1 ] = await runner(o)
  debug('ogs')
  debug('min', min1)
  debug('mean', mean1)
  debug('max', max1)
  debug('rp', rp1)

  var [ min2, mean2, max2, rps2 ] = await runner(u)
  debug('unfurl')
  debug('min', min2)
  debug('mean', mean2)
  debug('max', max2)
  debug('rps', rps2)
}

bench()
  .then(() => server.kill('SIGHUP'))

// fn is a bound function
async function runner (fn) {
  let timing = []

  let elapsed = microtime.now()

  for (let file of files) {
    try {
      let sent = microtime.now()
      await fn(file) // Disable oembed otherwise unfurl would be making another n+1 network requests
      let recv = microtime.now()
      let took = recv - sent

      timing.push(took)
    } catch (err) {
      debug(err)
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
