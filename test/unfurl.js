var requests = 0
var unfurl = require('../')
var util = require('util')

function work () {
  unfurl('https://medium.freecodecamp.com/how-you-can-land-a-6-figure-job-in-tech-with-no-connections-6eed0de26ea4')
    .then(result => {
      console.log('requests', ++requests)
      // console.log('result', util.inspect(result, false, null))
    })
    .catch(err => console.error)
}

setInterval(work, 100)
// work()
