export default class UnexpectedError extends Error {
    static EXPECTED_HTML: {
        message: string;
        name: string;
    };
    static BAD_OPTIONS: {
        message: string;
        name: string;
    };
    constructor(errorType: {
        message: string;
        name: string;
    });
}
