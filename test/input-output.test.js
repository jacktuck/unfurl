const serve = require('serve')
const delay = require('delay');

const unfurl = require('../index.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

const fs = require('fs')
const tests = [
  'bbc',
  'soundcloud',
  'youtube',
  'medium',
  'twitter',
  'imgur',
  'giphy'
]

const srcs = Object.assign({}, ...tests.map(test => ({
  [test]: {
    url: `http://localhost:1337/${test}.source.html`,
    expected: JSON.parse(fs.readFileSync(`${__dirname}/${test}.expected.json`).toString())
  }
})))

describe('input-output', function () {
  let server 

  before(function (done) {
    server = serve(__dirname, {
      port: 1337
    })

    delay(1500).then(_ => done())
    
  })

  after(function () {
    server.stop()
  })

  it('should resolve metadata for twitter', function () {
    return expect(unfurl(srcs.twitter.url)).to.be.fulfilled.and.to.eventually.become(srcs.twitter.expected)
  })

  it('should resolve metadata for bbc', function () {
    return expect(unfurl(srcs.bbc.url)).to.be.fulfilled.and.to.eventually.become(srcs.bbc.expected)
  })

  it('should resolve metadata for medium', function () {
    return expect(unfurl(srcs.medium.url)).to.be.fulfilled.and.to.eventually.become(srcs.medium.expected)
  })

  it('should resolve metadata for youtube', function () {
    return expect(unfurl(srcs.youtube.url)).to.be.fulfilled.and.to.eventually.become(srcs.youtube.expected)
  })

  it('should resolve metadata for imgur', function () {
    return expect(unfurl(srcs.imgur.url)).to.be.fulfilled.and.to.eventually.become(srcs.imgur.expected)
  })

  it('should resolve metadata for giphy', function () {
    return expect(unfurl(srcs.giphy.url)).to.be.fulfilled.and.to.eventually.become(srcs.giphy.expected)
  })
})
