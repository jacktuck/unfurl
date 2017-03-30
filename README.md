# Unfurled

## So, like, what does _unfurl_ even mean?
>make or become spread out from a rolled or folded state, especially in order to be open to the wind.

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

Or, if you're cool ([async/await](https://jakearchibald.com/2014/es7-async-functions/))

<img src="https://media.giphy.com/media/MqxZxTlvcY5BS/giphy.gif" width="350">

```
var unfurled = require('unfurled')

var result = await unfurled('http://example.com')
```
