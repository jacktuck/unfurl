// > Buffer.allocUnsafe(2)
// <Buffer 00 00>
// > let buf = Buffer.allocUnsafe(2)
// undefined
// > buf[0] = 102
// 102
// > buf[1] = 102
// 102
// > buf.toString()
// 'ff'
// > buf[0] = 4566
// 4566
// > buf[1] = 4566
// 4566
// > buf.toString()
// '��'
// > new Buffer().toString()











import unfurl from '../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from './server'

const port = 9000
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should detect html 5 encodings without header', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/5')
  // console.log('data', data)
})

test('should detect html 4 encodings with without header', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/4')
  // console.log('data', data)
})

test('should detect html 5 encodings with header', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/5')
  // console.log('data', data)

})

test('should detect html 4 encodings with header', async () => {
  const data = await unfurl(baseUrl + '/encoding/html/4')
  // console.log('data', data)
})