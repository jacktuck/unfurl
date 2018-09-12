const unfurl = require('..')
const fs = require('fs')
const http = require('http')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const test = require('tape')
const iconv = require('iconv-lite')

const port = 9000
const baseUrl = `http://localhost:${port}/`

// console.log('html', html)

const svr = http.createServer(function (req, res) {
  try {
    const match = /(utf8|gb2312)(.+)/.exec(req.url)

    if (match === null) {
      res.writeHead(500, 'unknown encoding')
      res.end()
    }

    const encoding = 'utf-8'//match[1]
    const file = match[2]

    const base = './test/html/'
    const path = base + file

    const original = fs.readFileSync(path).toString()
    // const converted = iconv.encode(original, encoding)

    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(original),
      'Content-Type': `text/html; charset=utf-8`
    })
    res.write(original)
    res.end()
  } catch (err) {
    res.writeHead(500, err.message)
    res.end()
  }
})

test('setup', t => svr.listen(port, t.end))

test('qq.com', t => {
  const data = unfurl(`${baseUrl}/gb2312/qq.com.html`).then(console.log, console.log)
})

test('teardown', t => svr.close(t.end))
