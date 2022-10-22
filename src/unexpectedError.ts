export default class UnexpectedError extends Error {
  static EXPECTED_HTML = {
    message:
      'Wrong content type header - "text/html" or "application/xhtml+xml" was expected',
    name: "WRONG_CONTENT_TYPE",
  };

  static BAD_OPTIONS = {
    message: "Bad options (see Opts), options must be an Object",
    name: "BAD_OPTIONS",
  };

  static BAD_HTTP_STATUS = {
    message: "Error in http request (http status not OK)",
    name: "BAD_HTTP_STATUS",
  };

  info: {
    contentLength?: number;
    contentType?: string;
    httpStatus?: string;
  };

  constructor(errorType: { message: string; name: string; info? }) {
    super(errorType.message);

    this.name = errorType.name;
    this.stack = new Error().stack;
    this.info = errorType.info;
  }
}
