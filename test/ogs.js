var requests = 0
var openGraphScraper = require('open-graph-scraper')

//https://medium.freecodecamp.com/how-you-can-land-a-6-figure-job-in-tech-with-no-connections-6eed0de26ea4

function work () {
  openGraphScraper({url: 'https://facebook.com'}, function (err, result) {
    console.log('requests', ++requests)
  })
}

setInterval(work, 250)
