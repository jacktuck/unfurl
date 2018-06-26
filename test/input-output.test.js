const http = require('http')
const delay = require('delay')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const serve = serveStatic('./test')

const unfurl = require('../index.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

const fs = require('fs')

const sites = [
  'bbc',
  'soundcloud',
  'youtube',
  'medium',
  'twitter',
  'imgur',
  'giphy'
]

describe('input-output', function () {
  const server = http.createServer(function(req, res) {
    const handler = finalhandler(req, res)
    serve(req, res, handler)
  })

  after(function () {
    server.close()
  })

  before(function (done) {
    server.listen(8080, function (err) {
      console.log('Listening on port 8080')
      done(err)
    })
  })

  for (const site of sites) {
    const url = `http://localhost:8080/${site}.source.html`
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/${site}.expected.json`).toString())

    it (`should resolve metadata for ${site}`, function () {
      return expect(unfurl(url)).to.be.fulfilled.and.to.eventually.become(expected)
    }).timeout(10000)
  }
})