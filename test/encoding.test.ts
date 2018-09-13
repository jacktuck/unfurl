import unfurl from '../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from './server'

console.log('testServer', TestServer)

const port = 9000
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should detect html 5 content type', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/5')
  console.log('data', data)


})

test('should detect html 4 content type', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/4')
  console.log('data', data)
})
