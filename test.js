const unfurl = require('./dist')

let url

;(async () => {
// url = 'https://www.theguardian.com/business/2018/sep/07/ba-british-airways-chief-alex-cruz-compensate-customers-after-data-breach'
// url = 'https://www.bbc.co.uk/news/entertainment-arts-45444998'
  // const url = 'https://github.com/trending'
// url = 'https://www.youtube.com/watch\?v\=cwQgjq0mCdE'
url = 'https://www.gohighlevel.com/blog/2018/04/25/the-winner-take-all-world-of-dental-reviews/index.html'

  // let result = await unfurl('https://www.youtube.com/watch\?v\=cwQgjq0mCdE')
  let result = await unfurl(url)

  console.log(JSON.stringify(result, null, 4))
})()
