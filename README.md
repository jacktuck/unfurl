# Unfurled

## So, like, what does _unfurl_ even mean?
>Spread out from a rolled or folded state

## Install

`yarn add unfurled`

## Usage

### unfurled(url, [opts])

#### url - `string (of url) || object` of:
- `uri` || `url` - fully qualified uri or a parsed url object from `url.parse()`
- `baseUrl` - fully qualified uri string used as the base url
- `headers` - http headers (default: `{ 'user-agent': 'facebookexternalhit' }`)

---

#### opts - `object` of:
* `ogp` - get open graph metadata (`true || false`) (default: `true`)
* `twitter` - get twitter-card metadata (`true || false`)  (default: `true`)
* `oembed` - get oembed metadata (`true || false`) (default: `true`)
* `other` - get other metadata too (e.g. description and title) (`true || false`) (default: `true`)

```
var unfurled = require('unfurled')

unfurled('http://example.com')
  .then(console.log)
  .catch(console.error)
```

_Or if you're cool and use [ES7 async await](https://jakearchibald.com/2014/es7-async-functions/)_

<img src="https://media.giphy.com/media/MqxZxTlvcY5BS/giphy.gif" width="350">

```
var unfurled = require('unfurled')

var result = await unfurled('http://example.com')
```
