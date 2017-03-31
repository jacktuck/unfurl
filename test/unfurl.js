var requests = 0
var unfurl = require('../')
var util = require('util')

function work () {
  unfurl('http://127.0.0.1:8080/test/imgur')
    .then(result => {
      // console.log('requests', ++requests)
      console.log('result', util.inspect(result, false, null))
    })
    .catch(err => console.error)
}//()

// setInterval(work, 100)
work()
