export default class UnexpectedError extends Error {
  static EXPECTED_HTML = {
    message: 'Wrong content type header - "text/html" or "application/xhtml+xml" was expected',
    name: 'WRONG_CONTENT_TYPE'
  }

  // static EXPECTED_JSON = {
  //   message: 'Wrong content type header - "application/json" was expected',
  //   name: 'WRONG_CONTENT_TYPE'
  // }

  constructor(errorType: { message: string, name: string }) {
    super(errorType.message)

    this.name = errorType.name
    this.stack = new Error().stack
  }
}

