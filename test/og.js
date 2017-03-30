var requests = 0
var og = require('../')

function work () {
  og('http://127.0.0.1:8080/test/imgur')
    .then(result => {
      // console.log('result', result)
      console.log('requests', ++requests)
    })
    .catch(err => console.error)
}//()

// setInterval(work, 100)
work()
