/* global describe after before it */

const http = require('http')
const send = require('send')

const unfurl = require('../index.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

const links = require('./links')
const fs = require('fs')
const parse = require('url').parse
const iconv = require('iconv-lite')
const qs = require('qs')
describe('input-output', function () {

  // takes a file stored it in utf-8 and encode it to charset from defined in querystring
  const server = http.createServer(function (req, res) {
    // console.log('url',__dirname + req.url)

    const parsedUrl = parse(req.url)
    // console.log('parsedUrl', parsedUrl)

    const query = qs.parse(parsedUrl.query)

    const charset = query.charset
    console.log('server charset', charset)

    const html = fs.readFileSync(__dirname + parsedUrl.pathname) // file is utf-8
    console.log('html', html)

    const encoded = iconv.encode(iconv.decode(html, 'utf-8'), charset)
    console.log('encoded', encoded)

    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(html),
      'Content-Type': `text/html; charset=${charset}`
    })
    res.write(encoded)
    res.end()
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

  for (const [charset, link] of links) {
    const name = parse(link).host
    const url = `http://localhost:8080/${name}.source.html?charset=${charset}`
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/${name}.expected.json`).toString())

    it(`should resolve metadata for ${name}`, async function () {
      return expect(unfurl(url).catch(console.error)).to.be.fulfilled.and.to.eventually.become(expected)
    }).timeout(10000)
  }
})
