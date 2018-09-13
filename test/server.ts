const fs = require('fs')
const http = require('http')

export default http.createServer(function (req, res) {
  try {
    const p = req.url

    if (p === '/encoding/html/4') {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(\102),
        'Content-Type': `text/html; charset=utf-8`
      })
      res.write(\102)
      res.end()
    }

    if (p === '/encoding/html/5') {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(\102),
        'Content-Type': `text/html; charset=utf-8`
      })
      res.write(\102)
      res.end()
    }
  } catch (err) {
    res.writeHead(500, err.message)
    res.end()
  }
})
