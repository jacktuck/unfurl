import * as fs from 'fs'
import * as http from 'http'

export default http.createServer(function (req, res) {
  try {
    const route = req.url

    // console.log('GOT ROUTE', route)

    if (route === '/json/oembed.json') {
      // console.log('INSIDE ROUTE /json/oembed')
      const json = fs.readFileSync(__dirname + '/oembed/oembed.json')

      // console.log('FOOO!')
      // console.log('json', json.toString())

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(json),
        'Content-Type': `application/json`
      })
      res.write(json)
      res.end()
    }

    if (route === '/html/oembed') {
      // console.log('INSIDE ROUTE /html/oembed')
      const html = fs.readFileSync(__dirname + '/oembed/oembed.html')
      // console.log('html', html.toString())

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/multi') {
      const html = fs.readFileSync(__dirname + '/twitter_card/multi.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/apps') {
      const html = fs.readFileSync(__dirname + '/twitter_card/apps.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/images') {
      const html = fs.readFileSync(__dirname + '/twitter_card/images.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/players') {
      const html = fs.readFileSync(__dirname + '/twitter_card/players.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/encoding/html/4') {
      const html = fs.readFileSync(__dirname + '/encoding/html_4.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/encoding/html/5') {
      const html = fs.readFileSync(__dirname + '/encoding/html_5.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }
  } catch (err) {
    // console.log('ERR', err)
    res.writeHead(500, err.message)
    res.end()
  }
})
