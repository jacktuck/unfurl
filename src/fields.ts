// twitter card markup https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup.html


export default [
  {
    in: 'twitter:card',
    out: 'card'
  },
  {
    in: 'twitter:url',
    out: 'url'
  },
  {
    in: 'twitter:site',
    out: 'site'
  },
  {
    in: 'twitter:creator',
    out: 'creator'
  },
  {
    in: 'twitter:creator:id',
    out: 'creator_id'
  },
  {
    in: 'twitter:title',
    out: 'title'
  },
  {
    in: 'twitter:description',
    out: 'description'
  },
  {
    in: 'twitter:image',
    out: 'images',
    child: 'url'
  },
  {
    in: 'twitter:image:alt',
    parent: 'images',
    out: 'alt'
  },
  {
    in: 'twitter:player',
    out: 'players',
    child: 'url'
  },
  {
    in: 'twitter:player:stream',
    parent: 'players',
    out: 'stream'
  },
  {
    in: 'twitter:player:width',
    parent: 'players',
    out: 'width'
  },
  {
    in: 'twitter:player:height',
    parent: 'players',
    out: 'height'
  },
  {
    in: 'twitter:app:name:iphone',
    parent: 'twitter_app',
    out: 'iphone_name'
  },
  {
    in: 'twitter:app:id:iphone',
    parent: 'twitter_app',
    out: 'iphone_id'
  },
  {
    in: 'twitter:app:url:iphone',
    parent: 'twitter_app',
    out: 'iphone_url'
  },
  {
    in: 'twitter:app:name:ipad',
    parent: 'twitter_app',
    out: 'ipad_name'
  },
  {
    in: 'twitter:app:id:ipad',
    parent: 'twitter_app',
    out: 'ipad_id'
  },
  {
    in: 'twitter:app:url:ipad',
    parent: 'twitter_app',
    out: 'ipad_url'
  },
  {
    in: 'twitter:app:name:googleplay',
    parent: 'twitter_app',
    out: 'googleplay_name'
  },
  {
    in: 'twitter:app:id:googleplay',
    parent: 'twitter_app',
    out: 'googleplay_id'
  },
  {
    in: 'twitter:app:url:googleplay',
    parent: 'twitter_app',
    out: 'googleplay_url'
  }
]

