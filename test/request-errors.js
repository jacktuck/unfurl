const unfurl = require('../index.js')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))

describe('request module', function () {
  it('should reject if URI is not valid', function () {
    return expect(unfurl('123')).to.be.rejectedWith('Invalid URI')
  })

  it('should reject if ENOTFOUND', function () {
    return expect(unfurl('http://foo.bar')).to.be.rejectedWith('ENOTFOUND')
  })
})
