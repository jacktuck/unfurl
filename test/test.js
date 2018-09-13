const unfurl = require('..')
const fs = require('fs')
const http = require('http')
const test = require('tape')
const iconv = require('iconv-lite')
const jschardet = require('jschardet')
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

    const encoding = match[1]
    const file = match[2]

    console.log('encoding', encoding)
    console.log('file', file)
    const base = './test/html/'
    const path = base + file

    const original = fs.readFileSync(path)
    // const converted = iconv.encode(iconv.decode(original, 'utf-8'), encoding)

    // console.log('original', original.slice(0, 1024).toString())
    // console.log('converted', converted.slice(0, 1024).toString())
    console.log('jschardet -> original', jschardet.detect(original))
    // console.log('jschardet -> converted', jschardet.detect(converted))

    // console.log('original', original)
    // console.log('converted', converted)

    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(original),
      'Content-Type': `text/html; charset=${encoding}`
    })
    res.write(original)
    res.end()
  } catch (err) {
    res.writeHead(500, err.message)
    res.end()
  }
})

test('setup', t => svr.listen(port, t.end))

test('qq.com', async t => {
  t.plan(1)

  const actual = await unfurl(`${baseUrl}/gb2312/qq.com/source.html`)
  console.log('actual', actual)

  const expected = JSON.parse(
    fs.readFileSync(`${__dirname}/html/qq.com/expected.json`).toString()
  )

  t.deepEquals(actual, expected)
  t.end()
})

test('teardown', t => svr.close(t.end))
