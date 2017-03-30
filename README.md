# Unfurled: Unfurl oEmbed, Twitter Cards and Open Graph metadata :sparkles:

## So, like, what does _unfurl_ even mean?
>make or become spread out from a rolled or folded state, especially in order to be open to the wind.

## Install

`npm install unfurled`

## Usage

### unfurled(url, [opts])

```
var unfurled = require('unfurled')

unfurled('http://example.com')
  .then(console.log)
  .catch(console.error)
```

Or, if you're cool ([u wot?](https://jakearchibald.com/2014/es7-async-functions/))

```
var unfurled = require('unfurled')

var result = await unfurled('http://example.com')
```
