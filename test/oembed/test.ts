import unfurl from '../../src/'
import TestServer from '../server'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should no-op and not throw for wrong content type', async () => {
  // console.log('starting test')
  const result = await unfurl(baseUrl + '/html/oembed-broken')

  // console.log('result', result)

  expect(result.oEmbed).toEqual({})
})

test('width/height should be numbers', async () => {
  const result: any = await unfurl(baseUrl + '/html/oembed')

  expect(result.oEmbed.width).toEqual(640)
  expect(result.oEmbed.height).toEqual(640)

  expect(result.oEmbed.thumbnails[0].width).toEqual(200)
  expect(result.oEmbed.thumbnails[0].height).toEqual(200)
})


test('should build oEmbed from JSON', async () => {
  // console.log('starting test')
  const result: any = await unfurl(baseUrl + '/html/oembed')

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
    thumbnails: [
      {
        url: 'https://gfycat.com/uk/gifs/detail/impressionablewaterloggedabalone',
        width: 200,
        height: 200
      }
    ]
  }

  expect(result.oEmbed).toEqual(expected)
})

test('should build oEmbed from XML', async () => {
  // console.log('starting test')
  const result: any = await unfurl(baseUrl + '/html/oembed-xml')

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
    thumbnails: [
      {
        url: 'https://gfycat.com/uk/gifs/detail/impressionablewaterloggedabalone',
        width: 200,
        height: 200
      }
    ]
  }

  console.log(JSON.stringify({expected, resukt: result.oEmbed}, null, 2))

  expect(result.oEmbed).toEqual(expected)
})
