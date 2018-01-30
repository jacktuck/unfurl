const fs = require('fs')
const Inliner = require('inliner')
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

let serve = require('serve')

server = serve(__dirname, {
  port: 9000
})

// connect().use(serveStatic(__dirname)).listen(9000, function () {
  for (const [name, link] of links) {
    console.log('GENERATING', name, link)

    new Inliner(link, {
      inlinemin: true
    }, function (error, html) {
      if (error) {
        console.log({error, link})
        process.exit()
      }

      fs.writeFileSync(`${name}.source.html`, html)
      console.log('saving html')
      unfurl(`http://localhost:9000/${name}.source.html`).then(result => {
        console.log('saving json')
        fs.writeFileSync(`${name}.expected.json`, JSON.stringify(result))
      }).catch(err => {
        console.log('THAT IS NOT GOOD', err)
      })
    })
  }
// })
