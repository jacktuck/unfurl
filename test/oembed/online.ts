import { unfurl } from '../../src/'

test.skip('should work for live youtube content', async () => {
  const result = await unfurl('https://www.youtube.com/watch?v=ccYpEv4APec', { oembed: true });

  // console.log(result);
  expect(result.oEmbed).not.toEqual(undefined);
})