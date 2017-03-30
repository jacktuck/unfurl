# Unfurled

## So, like, what does _unfurl_ even mean?
>Spread out from a rolled or folded state

## Install

`yarn add unfurled`

## Usage

### unfurled(url, [opts])

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
