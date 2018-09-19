import unfurl from '../../src/'
import TestServer from '../server'

const port = process.env.port
const baseUrl = `http://localhost:${port}`

beforeAll(then => TestServer.listen(port, then))
afterAll(then => TestServer.close(then))

test('should detect html 5 charset', async () => {
  const result = await unfurl(baseUrl + '/encoding/html/5')

  const expected = {
    description: '腾讯网从2003年创立至今，已经成为集新闻信息，区域垂直生活服务、社会化媒体资讯和产品为一体的互联网媒体平台。腾讯网下设新闻、科技、财经、娱乐、体育、汽车、时尚等多个频道，充分满足用户对不同类型资讯的需求。同时专注不同领域内容，打造精品栏目，并顺应技术发展趋势，推出网络直播等创新形式，改变了用户获取资讯的方式和习惯。',
    favicon: 'http://mat1.gtimg.com/www/icon/favicon2.ico',
    oEmbed: {},
    open_graph: {},
    title: '腾讯首页',
    twitter_card: {}
  }

  expect(result).toEqual(expected)
})

test('should detect html 4 charset', async () => {
  const result = await unfurl(baseUrl + '/encoding/html/4')

  const expected = {
    description: '腾讯网从2003年创立至今，已经成为集新闻信息，区域垂直生活服务、社会化媒体资讯和产品为一体的互联网媒体平台。腾讯网下设新闻、科技、财经、娱乐、体育、汽车、时尚等多个频道，充分满足用户对不同类型资讯的需求。同时专注不同领域内容，打造精品栏目，并顺应技术发展趋势，推出网络直播等创新形式，改变了用户获取资讯的方式和习惯。',
    favicon: 'http://mat1.gtimg.com/www/icon/favicon2.ico',
    oEmbed: {},
    open_graph: {},
    title: '腾讯首页',
    twitter_card: {}
  }

  expect(result).toEqual(expected)
})
