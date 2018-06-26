const http = require('http')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')

const fs = require('fs')
const fetch = require('node-fetch')
const unfurl = require('..')

const links = [
  ['bbc', 'http://www.bbc.co.uk/news/world-us-canada-42853225'],
  ['youtube', 'https://www.youtube.com/watch?v=2Vv-BfVoq4g'],
  ['soundcloud', 'https://soundcloud.com/smixx/smixx-developers-feat-steve'],
  ['medium', 'https://medium.com/@rdsubhas/10-modern-software-engineering-mistakes-bc67fbef4fc8'],
  ['twitter', 'https://twitter.com/ocdvids/status/856886314138042368'],
  ['imgur', 'https://imgur.com/t/dogs/QqHYV'],
  ['giphy', 'https://giphy.com/gifs/kiss-brad-pitt-thank-you-yoJC2El7xJkYCadlWE']
]

const serve = serveStatic('./')

const server = http.createServer(function(req, res) {
  const handler = finalhandler(req, res)
  serve(req, res, handler)
})

server.listen(1337, async function (err) {
  try {
    console.log('Listening on port 1337')

    for (const [name, link] of links) {
      console.log('link', link)
  
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

