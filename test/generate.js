const http = require('http')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')

const fs = require('fs')
const fetch = require('node-fetch')
const unfurl = require('..')

const links = require('./links')
const url = require('url')
const serve = serveStatic('./')

const server = http.createServer(function (req, res) {
  const handler = finalhandler(req, res)
  serve(req, res, handler)
})

server.listen(1337, async function () {
  try {
    console.log('Listening on port 1337')

    for (const link of links) {
      const name = url.parse(link).host
      console.log('link', link)
      console.log('name', name)

      const html = await fetch(link).then(res => res.text())

      fs.writeFileSync(`${name}.source.html`, html)

      console.log('writing json to', `${name}.expected.json`)
      const json = await unfurl(`http://localhost:1337/${name}.source.html`)
        .then(res => JSON.stringify(res, null, 4))

      fs.writeFileSync(`${name}.expected.json`, json)
    }

    server.close()
  } catch (err) {
    console.log('ERR', err)
    server.close()
  }
})
