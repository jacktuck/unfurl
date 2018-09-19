import * as fs from 'fs'
import * as http from 'http'

export default http.createServer(function (req, res) {
  try {
    const route = req.url

    // console.log('GOT ROUTE', route)
    if (route === '/image') {
      // console.log('HIT XML ROUTE')
      const buffer = new Buffer()

      res.writeHead(200, {
        'Content-Length': buffer.byteLength,
        'Content-Type': `image/png`
      })
      res.write(buffer)
      res.end()
    }

    if (route === '/json/oembed.json') {
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

    if (route === '/html/oembed-xml') {
      console.log('INSIDE ROUTE /html/oembed-xml')
      const html = fs.readFileSync(__dirname + '/oembed/oembed-xml.html')
      console.log('html', html.toString())

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/xml/oembed.xml') {
      const xml = fs.readFileSync(__dirname + '/oembed/oembed.xml')

      console.log('FOOO!')
      // console.log('xml', xml.toString())

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(xml),
        'Content-Type': `text/xml`
      })
      res.write(xml)
      res.end()
    }

     if (route === '/html/oembed-broken') {
      // console.log('INSIDE ROUTE /html/oembed')
      const html = fs.readFileSync(__dirname + '/oembed/oembed-broken.html')
      // console.log('html', html.toString())

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
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

    if (route === '/open_graph/relative_url') {
      const html = fs.readFileSync(__dirname + '/open_graph/relative_url.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/open_graph/multi') {
      const html = fs.readFileSync(__dirname + '/open_graph/multi.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/open_graph/audio') {
      const html = fs.readFileSync(__dirname + '/open_graph/audio.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/open_graph/images') {
      const html = fs.readFileSync(__dirname + '/open_graph/images.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/open_graph/videos') {
      const html = fs.readFileSync(__dirname + '/open_graph/videos.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/twitter_card/relative_url') {
      const html = fs.readFileSync(__dirname + '/twitter_card/relative_url.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/twitter_card/multi') {
      const html = fs.readFileSync(__dirname + '/twitter_card/multi.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/twitter_card/apps') {
      const html = fs.readFileSync(__dirname + '/twitter_card/apps.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/twitter_card/images') {
      const html = fs.readFileSync(__dirname + '/twitter_card/images.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/twitter_card/players') {
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
