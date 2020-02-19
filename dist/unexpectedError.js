"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnexpectedError extends Error {
    constructor(errorType) {
        super(errorType.message);
        this.name = errorType.name;
        this.stack = new Error().stack;
        this.info = errorType.info;
    }
}
exports.default = UnexpectedError;
UnexpectedError.EXPECTED_HTML = {
    message: 'Wrong content type header - "text/html" or "application/xhtml+xml" was expected',
    name: 'WRONG_CONTENT_TYPE'
};
UnexpectedError.BAD_OPTIONS = {
    message: 'Bad options (see Opts), options must be an Object',
    name: 'BAD_OPTIONS'
};
//# sourceMappingURL=unexpectedError.js.map