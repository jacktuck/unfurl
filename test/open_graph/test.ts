const unfurl = require('../../src/')
import TestServer from '../server'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should build videos[]', async () => {
  const result = await unfurl(baseUrl + '/open_graph/videos')
  const expected = {
    videos: [
      {
        url: 'https://www.youtube.com/embed/mvSItvjFE1c',
        secure_url: 'https://www.youtube.com/embed/mvSItvjFE1c',
        type: 'text/html',
        width: 1280,
        height: 720,
        tags: [
          'Eminem',
          'Lucky',
          'You',
          'Aftermath',
          'Rap'
        ]
      },
      {
        url: 'http://www.youtube.com/v/mvSItvjFE1c?version=3&autohide=1',
        secure_url: 'https://www.youtube.com/v/mvSItvjFE1c?version=3&autohide=1',
        type: 'application/x-shockwave-flash',
        width: 1280,
        height: 720,
        tags: [
          'Eminem',
          'Lucky',
          'You',
          'Aftermath',
          'Rap'
        ]
      }
    ]
  }

  expect(result.open_graph).toEqual(expected)
})

test('should build images[]', async () => {
  const result = await unfurl(baseUrl + '/open_graph/images')
  const expected = {
    images: [
      {
        url: 'https://assets-cdn.github.com/images/modules/open_graph/github-logo.png',
        type: 'image/png',
        width: 1200,
        height: 1200
      },
      {
        url: 'https://assets-cdn.github.com/images/modules/open_graph/github-mark.png',
        type: 'image/png',
        width: 1200,
        height: 620
      },
      {
        url: 'https://assets-cdn.github.com/images/modules/open_graph/github-octocat.png',
        type: 'image/png',
        width: 1200,
        height: 620
      }
    ]
  }

  // (JSON.stringify(result, null, 2))

  expect(result.open_graph).toEqual(expected)
})

test('should build audio[]', async () => {
  const result = await unfurl(baseUrl + '/open_graph/audio')
  const expected = {
    audio: [
      {
        url: 'https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
        secure_url: 'https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
        type: 'audio/vnd.facebook.bridge'
      },
      {
        url: 'https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
        secure_url: 'https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
        type: 'audio/vnd.facebook.bridge'
      }
    ]
  }

  // (JSON.stringify(result,null,2))

  expect(result.open_graph).toEqual(expected)
})

test('should quality relative urls', async () => {
  const result = await unfurl(baseUrl + '/open_graph/relative_url')
  const expected = {
    images: [
      {
        'url': 'http://localhost:9000/github-logo.png'
      },
      {
        'url': 'http://localhost:9000/open_graph/github-mark.png'
      },
      {
        'url': 'http://localhost:9000/github-octocat.png'
      }
    ]
  }

  // (JSON.stringify(result, null, 2))
  expect(result.open_graph).toEqual(expected)
})

// test('should build card', async () => {
//   const result = await unfurl(baseUrl + '/twitter_card/multi')

//   const expected = {
//     apps: '{
//       googleplay: '{
//         id: 'com.coinbase.android',
//         name: 'Coinbase - Buy/Sell Digital Currency'
//       },
//       iphone: {
//         id: '886427730',
//         name: 'Coinbase - Buy/Sell Digital Currency'
//       },
//       ipad: {
//         id: '886427730',
//         name: 'Coinbase - Buy/Sell Digital Currency'
//       }
//     },
//     card: 'summary',
//     creator: '@coinbase',
//     description: 'Coinbase is a secure online platform for buying, selling, transferring, and storing digital currency.',
//     images: [
//       {
//         url: 'https://www.coinbase.com/img/og-home.jpg'
//       }
//     ],
//     site: '@coinbase',
//     title: 'Coinbase - Buy/Sell Digital Currency'
//   }

//   expect(result.twitter_card).toEqual(expected)
// })
