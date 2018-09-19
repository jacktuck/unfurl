"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var UnexpectedError = /** @class */ (function (_super) {
    __extends(UnexpectedError, _super);
    function UnexpectedError(errorType) {
        var _this = _super.call(this, errorType.message) || this;
        _this.name = errorType.name;
        _this.stack = new Error().stack;
        return _this;
    }
    UnexpectedError.EXPECTED_HTML = {
        message: 'Wrong content type header - "text/html" or "application/xhtml+xml" was expected',
        name: 'WRONG_CONTENT_TYPE'
    };
    UnexpectedError.BAD_OPTIONS = {
        message: 'Bad options (see Opts), options must be an Object',
        name: 'BAD_OPTIONS'
    };
    return UnexpectedError;
}(Error));
exports.default = UnexpectedError;
//# sourceMappingURL=unexpectedError.js.map