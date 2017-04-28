const unfurl = require('../index.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

let srcs = {
  twitter: {
    url: 'http://localhost:8080/twitter.html', // https://twitter.com/ocdvids/status/856886314138042368
    expected: require('./expected/twitter')
  },
  bbc: {
    url: 'http://localhost:8080/bbc.html', // http://www.bbc.co.uk/news/technology-39441825
    expected: require('./expected/bbc')
  },
  medium: {
    url: 'http://localhost:8080/medium.html', // https://medium.freecodecamp.com/the-domain-name-system-dns-is-the-backbone-of-the-internet-heres-how-it-all-works-5706d0afa0fa
    expected: require('./expected/medium')
  }
}

console.log('srcs', srcs)

describe('input-output', function () {
  before(function (done) {
    let serveStatic = require('serve-static')
    let connect = require('connect')

    connect().use(serveStatic(__dirname + '/html')).listen(8080, function () {
      console.log('Server running on 8080...')
      done()
    })
  })

  it('should resolve metadata for twitter.com (tweet)', function () {
    return expect(unfurl(srcs.twitter.url)).to.be.fulfilled.and.to.eventually.become(srcs.twitter.expected)
  })

  it('should resolve metadata for bbc.co.uk (post)', function () {
    return expect(unfurl(srcs.bbc.url)).to.be.fulfilled.and.to.eventually.become(srcs.bbc.expected)
  })

  it('should resolve metadata for medium.com (post)', function () {
    return expect(unfurl(srcs.medium.url)).to.be.fulfilled.and.to.eventually.become(srcs.medium.expected)
  })
})
