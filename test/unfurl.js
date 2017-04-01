var requests = 0
var unfurl = require('../')
var util = require('util')

function work () {
  unfurl('https://imgur.com/gallery/fhAIf')
    .then(result => {
      console.log('requests', ++requests)
      console.log('result', util.inspect(result, false, null))
    })
    .catch(err => console.error(err))
}
work()
// setInterval(work, 250)
