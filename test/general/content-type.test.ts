import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'

import { unfurl } from '../../src/'
import UnexpectedError from '../../src/unexpectedError'

import nock from 'nock'

test('should throw bad content type error', async () => {
  try {
    nock('http://localhost')
      .get('/image')
      .reply(200, '', {
        'Content-Type': 'image/png'
      })

    await unfurl('http://localhost/image')
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.EXPECTED_HTML.name)
    expect(err.message).toEqual(UnexpectedError.EXPECTED_HTML.message)
  }
})
