"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const content_type_1 = require("content-type");
const htmlparser2_1 = require("htmlparser2");
// import iconv from 'iconv-lite'
const node_fetch_1 = require("node-fetch");
const debug_1 = require("debug");
const fields_1 = require("./fields");
class UnexpectedError extends Error {
    constructor(errorType) {
        super(errorType.message);
        this.name = errorType.name;
        this.stack = new Error().stack;
    }
}
UnexpectedError.EXPECTED_HTML = {
    message: 'Wrong content type header when "text/html" or "application/xhtml+xml" was expected',
    name: 'WRONG_CONTENT_TYPE'
};
UnexpectedError.EXPECTED_JSON = {
    message: 'Wrong content type header when "application/json" was expected',
    name: 'WRONG_CONTENT_TYPE'
};
function isRelativeUrl(url) {
    return /^[a-z][a-z0-9+.-]*:/.test(url) === false;
}
unfurl('https://twitter.com');
function unfurl(url, opts) {
    opts = opts || {};
    opts = {
        fetch_oembed: opts.fetch_oembed !== undefined ? opts.fetch_oembed : true,
        timeout: opts.timeout !== undefined ? opts.timeout : 0,
        compress: opts.compress !== undefined ? opts.compress : true,
        size: opts.size !== undefined ? opts.size : 0,
        agent: opts.agent !== undefined ? opts.agent : null,
    };
    const metadata = [];
    const ctx = {
        url
    };
    return getPage(url, opts)
        .then(getLocalMetadata(metadata, ctx, opts))
        .then(getRemoteMetadata(metadata, ctx, opts));
}
function getPage(url, opts) {
    const log = debug_1.default('unfurl:getPage');
    console.log('url', url);
    return node_fetch_1.default(url, {
        headers: {
            Accept: 'text/html, application/xhtml+xml',
            agent: opts.agent
        },
        timeout: opts.timeout,
        follow: opts.follow,
        compress: opts.compress,
        size: opts.size,
    }).then(res => {
        let { type: contentType, parameters: { charset } } = content_type_1.parse(res.headers.get('Content-Type'));
        if (charset) {
            charset = charset.toUpperCase();
        }
        let contentLength = parseInt(res.headers.get('Content-Length') || '0');
        if (contentType !== 'text/html') {
            throw new UnexpectedError(UnexpectedError.EXPECTED_HTML);
        }
        return res.text()
            .catch(err => {
            console.log('error', err.message);
            if (err.code === 'Z_BUF_ERROR') {
                return;
            }
            process.nextTick(function () {
                throw err;
            });
        });
    });
}
function getLocalMetadata(metadata, ctx, opts) {
    return function (text) {
        return new Promise((resolve, reject) => {
            const parser = new htmlparser2_1.Parser({}, {
                decodeEntities: true
            });
            function onend() {
                resolve(metadata);
            }
            function onreset() {
                resolve(metadata);
            }
            function onerror(err) {
                console.log(err);
                reject(err);
            }
            function onopentagname(tag) {
                console.log(tag);
                this._tagname = tag;
            }
            function ontext(text) {
                console.log('tag', this._tagname);
                console.log('text', text);
                if (this._tagname === 'title') {
                    if (ctx.title === undefined) {
                        ctx.title = '';
                    }
                    ctx.title += text;
                }
            }
            function onopentag(name, attr) {
                if (opts.fetch_oembed && attr.type === 'application/json+oembed' && attr.href) {
                    console.log('saving oembed url');
                    ctx.oembed = attr.href;
                    return;
                }
                const prop = attr.name || attr.rel;
                const val = attr.content || attr.value;
                console.log('prop', prop);
                console.log('val', val);
                if (fields_1.default.includes(prop) === false)
                    return;
                if (!prop)
                    return;
                if (!val)
                    return;
                metadata.push([prop, val]);
            }
            function onclosetag(tag) {
                console.log(tag);
                this._tagname = '';
                console.log('THIS', this);
                if (tag === 'head') {
                    parser.reset();
                }
                if (tag === 'title') {
                    metadata.push(['title', ctx.title]);
                }
            }
            parser._cbs = {
                onopentag,
                ontext,
                onclosetag,
                onend,
                onreset,
                onerror,
                onopentagname
            };
            parser.write(text);
            parser.end();
        });
    };
}
// const encodings = [ 'CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP' ]
function getRemoteMetadata(metadata, ctx, opts) {
    return function () {
        console.log('got here', { metadata, ctx });
        console.log('ctx.oembed 1', ctx.oembed);
        if (!opts.fetch_oembed || !ctx.oembed) {
            return metadata;
        }
        // convert relative url to an absolute one
        if (isRelativeUrl(ctx.oembed)) {
            ctx.oembed = url_1.resolve(ctx.url, ctx.oembed);
        }
        console.log('ctx.oembed 2', ctx.oembed);
        return node_fetch_1.default(ctx.oembed).then(res => {
            let { type: contentType } = content_type_1.parse(res.headers.get('Content-Type'));
            if (contentType !== 'application/json') {
                throw new UnexpectedError(UnexpectedError.EXPECTED_JSON);
            }
            // JSON text SHALL be encoded in UTF-8, UTF-16, or UTF-32 https://tools.ietf.org/html/rfc7159#section-8.1
            return res.json();
        }).then(data => {
            const unwind = data.body || {}; // get(data, 'body', data, {})
            metadata.push(...Object.entries(unwind)
                .filter(([key]) => fields_1.default.includes(key))
                .map(arr => ['oembed', arr[0], arr[1]]));
            return metadata;
        }).catch(err => {
            console.log('GOT AN ERROR', err);
            return metadata;
        });
    };
}
exports.default = unfurl;
