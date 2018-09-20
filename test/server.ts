import * as fs from 'fs'
import * as http from 'http'

export default http.createServer(function (req, res) {
  try {
    const route = req.url

    if (route === '/image') {
      const buffer = Buffer.alloc(0)

      res.writeHead(200, {
        'Content-Length': buffer.byteLength,
        'Content-Type': `image/png`
      })
      res.write(buffer)
      res.end()
    }

    if (route === '/html/keyword-edge-cases') {
      const html = fs.readFileSync(__dirname + '/basic/keyword-edge-cases.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/html/basic') {
      const html = fs.readFileSync(__dirname + '/basic/basic.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/html/basic-duplicates') {
      const html = fs.readFileSync(__dirname + '/basic/basic-duplicates.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/json/oembed.json') {
      const json = fs.readFileSync(__dirname + '/oembed/oembed.json')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(json),
        'Content-Type': `application/json`
      })
      res.write(json)
      res.end()
    }

    if (route === '/html/oembed-xml') {
      const html = fs.readFileSync(__dirname + '/oembed/oembed-xml.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/xml/oembed.xml') {
      const xml = fs.readFileSync(__dirname + '/oembed/oembed.xml')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(xml),
        'Content-Type': `text/xml`
      })
      res.write(xml)
      res.end()
    }

    if (route === '/html/oembed-multi') {
      const html = fs.readFileSync(__dirname + '/oembed/oembed-multi.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/html/oembed-broken') {
      const html = fs.readFileSync(__dirname + '/oembed/oembed-broken.html')

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': `text/html`
      })
      res.write(html)
      res.end()
    }

    if (route === '/html/oembed') {
      const html = fs.readFileSync(__dirname + '/oembed/oembed.html')

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
      const html = fs.readFileSync(
        __dirname + '/twitter_card/relative_url.html'
      )

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

    if (route === '/encoding/html/euc-jp') {
      const html = fs.readFileSync(__dirname + '/encoding/euc-jp.html')

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
    res.writeHead(500, err.message)
    res.end()
  }
})
