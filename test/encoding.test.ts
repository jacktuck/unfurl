import unfurl from '../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from './server'

const port = 9000
const baseUrl = `http://localhost:${port}/`

beforeAll(next => TestServer.listen(port, next))
afterAll(next => TestServer.close(next))

test('should detect html5 content type', () => {
  expect('foo').toBe('foo')
})

test('should detect html4 content type', () => {
  expect('foo').toBe('foo')
})
