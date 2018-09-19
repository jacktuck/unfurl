import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from '../server'

import unfurl from '../../src/'
import UnexpectedError from '../../src/unexpectedError'

const port = 9000
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should throw bad content type error', async () => {
  try {
    await unfurl(baseUrl + '/xml')
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.EXPECTED_HTML.name)
    expect(err.message).toEqual(UnexpectedError.EXPECTED_HTML.message)
  }
})
