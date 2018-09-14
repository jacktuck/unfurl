import unfurl from '../../src/'
import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import TestServer from '../server'

const port = 9000
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should get oembed data', async () => {
  // console.log('starting test')
  const result = await unfurl(baseUrl + '/html/oembed')

  // console.log('RESULT!!!', JSON.stringify(result, null, 2))
  const expected = {
    version: '1.0',
    provider_url: 'https://gfycat.com',
    provider_name: 'Gfycat',
    type: 'video',
    title: 'The creation of a marble sculpture',
    html: `<div style='position:relative;padding-bottom:100.0%'><iframe src='https://gfycat.com/ifr/ImpressionableWaterloggedAbalone' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div>`,
    height: 640,
    width: 640,
    thumbnail: [
      {
        url: 'https://gfycat.com/uk/gifs/detail/impressionablewaterloggedabalone',
        width: 200,
        height: 200
      }
    ]
  }

  expect(result.oEmbed).toEqual(expected)
})
