import unfurl from '../../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from '../server'

const port = 9000
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should extract twitter:player:*', async () => {
  const result = await unfurl(baseUrl + '/players')
  const expected = {
    players: [
      {
        player: 'https://www.youtube.com/embed/mvSItvjFE1c',
        width: 1280,
        height: 720
      },
      {
        player: 'https://www.youtube.com/embed/mvSItvjFE1c',
        width: 1280,
        height: 720
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should extract twitter:image:*', async () => {
  const result = await unfurl(baseUrl + '/images')
  const expected = {
    images: [
      {
        url: 'https://media.giphy.com/media/3o7TKGXCZFWDe3lIbu/giphy-facebook_s.jpg',
        alt: 'first'
      },
      {
        url: 'https://media.giphy.com/media/3o7TKGXCZFWDe3lIbu/giphy-facebook_s.jpg',
        alt: 'second'
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should extract twitter:app:*', async () => {
  const result = await unfurl(baseUrl + '/apps')
  const expected = {
    apps: {
      googleplay: {
        id: 'com.coinbase.android',
        name: 'Coinbase - Buy/Sell Digital Currency'
      },
      ipad:  {
        id: '886427730',
        name: 'Coinbase - Buy/Sell Digital Currency'
      },
      iphone: {
        'id': '886427730',
        'name': 'Coinbase - Buy/Sell Digital Currency'
      }
    }
  }
  expect(result.twitter_card).toEqual(expected)
})

test('should extract twitter multiple', async () => {
  const result = await unfurl(baseUrl + '/multi')

  const expected = {
    apps: {
      googleplay: {
        id: 'com.coinbase.android',
        name: 'Coinbase - Buy/Sell Digital Currency'
      },
      iphone: {
        id: '886427730',
        name: 'Coinbase - Buy/Sell Digital Currency'
      },
      ipad: {
        id: '886427730',
        name: 'Coinbase - Buy/Sell Digital Currency'
      }
    },
    card: 'summary',
    creator: '@coinbase',
    description: 'Coinbase is a secure online platform for buying, selling, transferring, and storing digital currency.',
    images: [
      {
        url: 'https://www.coinbase.com/img/og-home.jpg'
      }
    ],
    site: '@coinbase',
    title: 'Coinbase - Buy/Sell Digital Currency'
  }

  expect(result.twitter_card).toEqual(expected)
})
