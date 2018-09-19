export default class UnexpectedError extends Error {
  static EXPECTED_HTML = {
    message: 'Wrong content type header - "text/html" or "application/xhtml+xml" was expected',
    name: 'WRONG_CONTENT_TYPE'
  }

  static BAD_OPTIONS = {
    message: 'Bad options (see Opts), options must be an Object',
    name: 'BAD_OPTIONS'
  }

  constructor (errorType: { message: string, name: string }) {
    super(errorType.message)

    this.name = errorType.name
    this.stack = new Error().stack
  }
}
