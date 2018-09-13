const fs = require('fs')
const http = require('http')

export default http.createServer(function (req, res) {
  try {
    console.log('HIT')
    const p = req.url

    console.log('P', p)
    if (p === '/encoding/html/4') {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength('foo'),
        'Content-Type': `text/html; charset=utf-8`
      })
      res.write('foo')
      res.end()
    }

    if (p === '/encoding/html/5') {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength('foo'),
        'Content-Type': `text/html; charset=utf-8`
      })
      res.write('foo')
      res.end()
    }
  } catch (err) {
    res.writeHead(500, err.message)
    res.end()
  }
})
