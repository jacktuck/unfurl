"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const content_type_1 = require("content-type");
const htmlparser2_1 = require("htmlparser2");
// import iconv from 'iconv-lite'
const node_fetch_1 = require("node-fetch");
const debug_1 = require("debug");
const fields_1 = require("./fields");
console.log(333, fields_1.default);
class UnexpectedError extends Error {
    constructor(errorType) {
        super(errorType.message);
        this.name = errorType.name;
        this.stack = new Error().stack;
    }
}
UnexpectedError.WRONG_CONTENT_TYPE = {
    message: 'Wrong content type header when "text/html" was expected',
    name: 'ERR_WRONG_CONTENT_TYPE'
};
function isRelativeUrl(url) {
    return /^[a-z][a-z0-9+.-]*:/.test(url) === false;
}
unfurl('http://fb.com', {});
function unfurl(url, opts) {
    opts = {
        fetch_oembed: opts.fetch_oembed !== undefined ? opts.fetch_oembed : true,
        timeout: opts.timeout !== undefined ? opts.timeout : 0,
        timeout_oembed: opts.timeout_oembed !== undefined ? opts.timeout_oembed : 0,
        compress: opts.compress !== undefined ? opts.compress : true,
        compress_oembed: opts.compress_oembed !== undefined ? opts.compress_oembed : true,
        size: opts.size !== undefined ? opts.size : 0,
        size_oembed: opts.size_oembed !== undefined ? opts.size_oembed : 0,
        agent: opts.agent !== undefined ? opts.agent : null,
        agent_oembed: opts.agent_oembed !== undefined ? opts.agent_oembed : null,
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
    log('url', url);
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
        res.body.once('error', (err) => {
            log('error', err.message);
            if (err.code === 'Z_BUF_ERROR') {
                return;
            }
            process.nextTick(function () {
                throw err;
            });
        });
        let { type: contentType, parameters: { charset } } = content_type_1.parse(res.headers.get('Content-Type'));
        if (charset) {
            charset = charset.toUpperCase();
        }
        let contentLength = parseInt(res.headers.get('Content-Length') || '0');
        if (contentType !== 'text/html') {
            throw new UnexpectedError(UnexpectedError.WRONG_CONTENT_TYPE);
        }
        return res;
    });
}
function getLocalMetadata(metadata, ctx, opts) {
    return function (res) {
        return new Promise((resolve, reject) => {
            const parser = new htmlparser2_1.Parser({}, {
                decodeEntities: true
            });
            const _reset = reset(res, parser);
            parser._cbs = {
                onopentag: onopentag(metadata, ctx, opts),
                ontext: ontext(metadata, ctx, opts),
                onclosetag: onclosetag(metadata, _reset),
                onend: onend(resolve, metadata),
                onreset: onreset(resolve, metadata),
                onerror: onerror(reject),
                onopentagname: onopentagname()
            };
            res.body.pipe(parser);
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
        return node_fetch_1.default(ctx.oembed, {
            headers: {
                Accept: 'application/json, text/javascript',
                agent: opts.agent_oembed
            },
            timeout: opts.timeout_oembed,
            follow: opts.follow_oembed,
            compress: opts.compress_oembed,
            size: opts.size_oembed
        }).then(res => {
            let { type: contentType } = content_type_1.parse(res.headers.get('Content-Type'));
            if (contentType !== 'application/json' && contentType !== 'text/javascript') {
                const err = new Error(`Bad content type: expected application/json or text/javascript, but got ${contentType}`);
                err.name = 'ERR_BAD_CONTENT_TYPE';
                throw err;
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
function onend(resolve, metadata) {
    const log = debug_1.default('unfurl:onend');
    return function () {
        resolve(metadata);
    };
}
function onreset(resolve, metadata) {
    const log = debug_1.default('unfurl:onreset');
    return function () {
        resolve(metadata);
    };
}
function onerror(reject) {
    const log = debug_1.default('unfurl:onerror');
    return function (err) {
        log(err);
        reject(err);
    };
}
function onopentagname() {
    const log = debug_1.default('unfurl:onopentagname');
    return function (tag) {
        log(tag);
        this._tagname = tag;
    };
}
function ontext(metadata, ctx, opts) {
    const log = debug_1.default('unfurl:ontext');
    return function (text) {
        log('tag', this._tagname);
        log('text', text);
        if (this._tagname === 'title') {
            if (ctx.title === undefined) {
                ctx.title = '';
            }
            ctx.title += text;
        }
    };
}
function onopentag(metadata, ctx, opts) {
    const log = debug_1.default('unfurl:onopentag');
    return function (name, attr) {
        log('name', name);
        log('attr', attr);
        console.log('OPTS', opts);
        if (opts.fetch_oembed && attr.type === 'application/json+oembed' && attr.href) {
            console.log('saving oembed url');
            ctx.oembed = attr.href;
            return;
        }
        const prop = attr.name || attr.rel;
        const val = attr.content || attr.value || attr.href;
        log('prop', prop);
        log('val', val);
        if (fields_1.default.includes(prop) === false)
            return;
        if (!prop)
            return;
        if (!val)
            return;
        metadata.push([prop, val]);
    };
}
function onclosetag(metadata, reset) {
    const log = debug_1.default('unfurl:onclosetag');
    return function (tag) {
        log(tag);
        this._tagname = '';
        if (tag === 'head') {
            reset();
        }
        if (tag === 'title') {
            metadata.push(['title', this._title]);
        }
    };
}
function reset(res, parser) {
    const log = debug_1.default('unfurl:reset');
    return function () {
        parser.end();
        parser.reset(); // resetting the parser to save cpu cycles and preempt redundant processing
        res.body.unpipe(parser);
        res.body.resume();
        if (typeof res.body.destroy === 'function') {
            res.body.destroy();
        }
    };
}
module.exports = unfurl;
