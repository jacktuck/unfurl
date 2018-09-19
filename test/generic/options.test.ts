import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import TestServer from '../server'

import unfurl from '../../src/'
import UnexpectedError from '../../src/unexpectedError'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should throw bad options error', async () => {
  try {
    // @ts-ignore
    await unfurl(baseUrl + '/fake/image', '')
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.BAD_OPTIONS.name)
    expect(err.message).toEqual(UnexpectedError.BAD_OPTIONS.message)
  }
})

test('should respect oembed', async () => {
  const result = await unfurl(baseUrl + '/html/oembed', { oembed: false })

  expect(result.oEmbed).toEqual({})
})
