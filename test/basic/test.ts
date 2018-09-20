const unfurl = require('../../src/')
import TestServer from '../server'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should detect title, description and keywords', async () => {
  const result = await unfurl(baseUrl + '/html/basic')

  const expected = {
    favicon: 'http://localhost:9000/favicon.ico',
    description: 'aaa',
    keywords: ['a', 'b', 'c'],
    title: 'ccc'
  }

  expect(result).toEqual(expected)
})

test('should detect last dupe of title, description and keywords', async () => {
  const result = await unfurl(baseUrl + '/html/basic-duplicates')

  const expected = {
    favicon: 'http://localhost:9000/favicon.ico',
    description: 'aaa',
    keywords: ['a', 'b', 'c'],
    title: 'ccc'
  }

  expect(result).toEqual(expected)
})

test('should detect last dupe of title, description and keywords', async () => {
  const result = await unfurl(baseUrl + '/html/keyword-edge-cases')

  const expected = {
    favicon: 'http://localhost:9000/favicon.ico',
    keywords: ['foo', 'bar', 'baz quix', 'foo', 'foo']
  }

  expect(result).toEqual(expected)
})
