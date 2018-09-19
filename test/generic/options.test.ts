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

test('should throw bad options error', async () => {
  try {
    await unfurl(baseUrl + '/fake/image', '')
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.BAD_OPTIONS.name)
    expect(err.message).toEqual(UnexpectedError.BAD_OPTIONS.message)
  }

  try {
    await unfurl(baseUrl + '/fake/image', [])
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.BAD_OPTIONS.name)
    expect(err.message).toEqual(UnexpectedError.BAD_OPTIONS.message)
  }

  try {
    await unfurl(baseUrl + '/fake/image', 1)
  } catch (err) {
    expect(err.name).toEqual(UnexpectedError.BAD_OPTIONS.name)
    expect(err.message).toEqual(UnexpectedError.BAD_OPTIONS.message)
  }
})
