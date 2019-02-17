export default class UnexpectedError extends Error {
    static EXPECTED_HTML: {
        message: string;
        name: string;
    };
    static BAD_OPTIONS: {
        message: string;
        name: string;
    };
    info: {
        contentLength?: number;
        contentType?: string;
    };
    constructor(errorType: {
        message: string;
        name: string;
        info?: any;
    });
}
