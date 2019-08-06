import { unfurl } from '../../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'

import nock from 'nock'

test('should build players[]', async () => {
  nock('http://localhost')
    .get('/twitter_card/players')
    .replyWithFile(200, __dirname + '/players.html', {
      'Content-Type': 'text/html'
    })

  const result = await unfurl('http://localhost/twitter_card/players')
  const expected = {
    players: [
      {
        url: 'https://www.youtube.com/embed/mvSItvjFE1c',
        width: 1280,
        height: 720
      },
      {
        url: 'https://www.youtube.com/embed/mvSItvjFE1c',
        width: 1280,
        height: 720
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should build images[]', async () => {
  nock('http://localhost')
    .get('/twitter_card/images')
    .replyWithFile(200, __dirname + '/images.html', {
      'Content-Type': 'text/html'
    })

  const result = await unfurl('http://localhost/twitter_card/images')
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
  nock('http://localhost')
    .get('/twitter_card/apps')
    .replyWithFile(200, __dirname + '/apps.html', {
      'Content-Type': 'text/html'
    })

  const result = await unfurl('http://localhost/twitter_card/apps')
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
  nock('http://localhost')
    .get('/twitter_card/relative_url')
    .replyWithFile(200, __dirname + '/relative_url.html', {
      'Content-Type': 'text/html'
    })

  const result = await unfurl('http://localhost/twitter_card/relative_url')
  const expected = {
    images: [
      {
        url: 'http://localhost/a.png',
        alt: 'a'
      },
      {
        url: 'http://localhost/twitter_card/b.png',
        alt: 'b'
      },
      {
        url: 'http://localhost/c.png',
        alt: 'c'
      },
      {
        url: 'http://localhost/twitter_card/d.png',
        alt: 'd'
      }
    ]
  }

  expect(result.twitter_card).toEqual(expected)
})

test('should build card', async () => {
  nock('http://localhost')
    .get('/twitter_card/multi')
    .replyWithFile(200, __dirname + '/multi.html', {
      'Content-Type': 'text/html'
    })

  const result = await unfurl('http://localhost/twitter_card/multi')

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
