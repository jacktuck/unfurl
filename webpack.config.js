  
const base = {
  mode: 'production',
  entry: {
    lib: './src/index'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }]
  }
}

module.exports = [
  Object.assign({}, base, {
    target: 'node',
    output: {
      filename: "index.js",
      libraryTarget: "commonjs2",
    },
  }),

  Object.assign({}, base, {
    target: 'web',
    output: {
      libraryTarget: "umd",
      filename: "browser.js",
      globalObject: 'this'
    },
  })
]