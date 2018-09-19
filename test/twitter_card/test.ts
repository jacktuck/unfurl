import unfurl from '../../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import TestServer from '../server'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should build players[]', async () => {
  const result = await unfurl(baseUrl + '/twitter_card/players')
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

test('should build images[]', async () => {
  const result = await unfurl(baseUrl + '/twitter_card/images')
  const expected = {
    images: [
      {
        url: 'https://example.com/a.png',
        alt: 'a'
      },
      {
        url: 'https://example.com/b.png',
        alt: 'b'
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should build apps[]', async () => {
  const result = await unfurl(baseUrl + '/twitter_card/apps')
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

test('should quality relative urls', async () => {
  const result = await unfurl(baseUrl + '/twitter_card/relative_url')
  const expected = {
    images: [
      {
        url: 'http://localhost:9000/a.png',
        alt: 'a'
      },
      {
        url: 'http://localhost:9000/twitter_card/b.png',
        alt: 'b'
      },
      {
        url: 'http://localhost:9000/c.png',
        alt: 'c'
      },
      {
        url: 'http://localhost:9000/twitter_card/d.png',
        alt: 'd'
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should build card', async () => {
  const result = await unfurl(baseUrl + '/twitter_card/multi')

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
