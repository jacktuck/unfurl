const fs = require('fs')
const http = require('http')

export default http.createServer(function (req, res) {
  try {
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength('foo'),
      'Content-Type': `text/html; charset=utf-8`
    })
    res.write('foo')
    res.end()
  } catch (err) {
    res.writeHead(500, err.message)
    res.end()
  }
})
