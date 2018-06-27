/* global describe after before it */

const http = require('http')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const serve = serveStatic('./test')

const unfurl = require('../index.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

const fs = require('fs')

const sites = require('./links').map(([site]) => site)

describe('input-output', function () {
  const server = http.createServer(function (req, res) {
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

    it(`should resolve metadata for ${site}`, async function () {
      return expect(unfurl(url).catch(console.error)).to.be.fulfilled.and.to.eventually.become(expected)
    }).timeout(10000)
  }
})
