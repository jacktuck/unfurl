"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const content_type_1 = require("content-type");
const htmlparser2_1 = require("htmlparser2");
// import iconv from 'iconv-lite'
const node_fetch_1 = require("node-fetch");
const UnexpectedError_1 = require("./UnexpectedError");
const schema_1 = require("./schema");
function unfurl(url, opts) {
    if (opts === undefined || opts.constructor.name !== 'Object') {
        opts = {};
    }
    // Setting defaults when not provided or not correct type
    typeof opts.oembed === 'boolean' || (opts.oembed = true);
    typeof opts.compress === 'boolean' || (opts.compress = true);
    typeof opts.agent === 'string' || (opts.agent = null);
    Number.isInteger(opts.follow) || (opts.follow = 50);
    Number.isInteger(opts.timeout) || (opts.timeout = 0);
    Number.isInteger(opts.size) || (opts.size = 0);
    // console.log('opts', opts)
    const ctx = {
        url
    };
    return getPage(url, opts)
        .then(getLocalMetadata(ctx, opts))
        .then(getRemoteMetadata(ctx, opts))
        .then(parse(ctx));
}
function getPage(url, opts) {
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
        if (contentType !== 'text/html' && contentType !== 'application/xhtml+xml') {
            throw new UnexpectedError_1.default(UnexpectedError_1.default.EXPECTED_HTML);
        }
        return res.text()
            .catch(err => {
            // console.log('error', err.message)
            if (err.code === 'Z_BUF_ERROR') {
                return;
            }
            process.nextTick(function () {
                throw err;
            });
        });
    });
}
function getLocalMetadata(ctx, opts) {
    return function (text) {
        const metadata = [];
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
                reject(err);
            }
            function onopentagname(tag) {
                this._tagname = tag;
            }
            function ontext(text) {
                if (this._tagname === 'title') {
                    // Makes sure we haven't already seen the title
                    if (this._title !== null) {
                        if (this._title === undefined) {
                            this._title = '';
                        }
                        this._title += text;
                    }
                }
            }
            function onopentag(name, attr) {
                if (opts.oembed && attr.type === 'application/json+oembed' && attr.href) {
                    // If url is relative we will make it absolute
                    ctx.oembedUrl = url_1.resolve(ctx.url, attr.href);
                    return;
                }
                const prop = attr.name || attr.property || attr.rel;
                const val = attr.content || attr.value;
                if (this._favicon !== null) {
                    let favicon;
                    // If url is relative we will make it absolute
                    if (attr.rel === 'shortcut icon') {
                        favicon = url_1.resolve(ctx.url, attr.href);
                    }
                    else if (attr.rel === 'icon') {
                        favicon = url_1.resolve(ctx.url, attr.href);
                    }
                    else {
                        favicon = url_1.resolve(ctx.url, '/favicon.ico');
                    }
                    if (favicon) {
                        metadata.push(['favicon', favicon]);
                        this._favicon = null;
                    }
                }
                // console.log('prop', prop)
                if (prop === 'description') {
                    metadata.push(['description', val]);
                }
                if (prop === 'keywords') {
                    metadata.push(['keywords', val]);
                }
                // console.log('PROP', prop)
                // console.log('VAL', val)
                // console.log('INCLUDES', keys.includes(prop))
                if (!prop ||
                    !val ||
                    schema_1.keys.includes(prop) === false) {
                    return;
                }
                metadata.push([prop, val]);
            }
            function onclosetag(tag) {
                this._tagname = '';
                // if (tag === 'head') {
                //   parser.reset()
                // }
                if (tag === 'title' && this._title !== null) {
                    metadata.push(['title', this._title]);
                    this._title = null;
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
function getRemoteMetadata(ctx, opts) {
    return function (metadata) {
        if (!opts.oembed || !ctx.oembedUrl) {
            return metadata;
        }
        return node_fetch_1.default(ctx.oembedUrl).then(res => {
            let { type: contentType } = content_type_1.parse(res.headers.get('Content-Type'));
            if (contentType !== 'application/json') {
                throw new UnexpectedError_1.default(UnexpectedError_1.default.EXPECTED_JSON);
            }
            // JSON text SHALL be encoded in UTF-8, UTF-16, or UTF-32 https://tools.ietf.org/html/rfc7159#section-8.1
            return res.json();
        }).then(data => {
            const oEmbed = Object.entries(data)
                .map(([k, v]) => ['oEmbed:' + k, v])
                .filter(([k, v]) => schema_1.keys.includes(String(k))); // to-do: look into why TS complains if i don't String()
            metadata.push(...oEmbed);
            return metadata;
        }).catch(err => {
            console.log('ERROR', err);
            return metadata;
        });
    };
}
function parse(ctx) {
    return function (metadata) {
        console.log('RAW', metadata);
        const parsed = {
            twitter_cards: {},
            open_graph: {},
            oEmbed: {}
        };
        let tags = [];
        let lastParent;
        for (let [metaKey, metaValue] of metadata) {
            const item = schema_1.schema.get(metaKey);
            console.log('KEY', metaKey);
            console.log('ITEM', item);
            if (!item) {
                parsed[metaKey] = metaValue;
                continue;
            }
            // Special case for video tags which we want to map to each video object
            if (metaKey === 'og:video:tag') {
                // console.log('pushing tag', metaValue)
                tags.push(metaValue);
                continue;
            }
            if (item.type === 'string') {
                metaValue = metaValue.toString();
            }
            else if (item.type === 'number') {
                metaValue = parseInt(metaValue);
            }
            else if (item.type === 'url') {
                metaValue = url_1.resolve(ctx.url, metaValue);
            }
            let target = parsed[item.entry];
            // console.log('TARGET', target)
            if (Array.isArray(target)) {
                if (!target[target.length - 1]) {
                    target.push({});
                }
                target = target[target.length - 1];
            }
            if (item.parent) {
                if (item.category) {
                    if (!target[item.parent]) {
                        target[item.parent] = {};
                    }
                    if (!target[item.parent][item.category]) {
                        target[item.parent][item.category] = {};
                    }
                    target = target[item.parent][item.category];
                }
                else {
                    if (Array.isArray(target[item.parent]) === false) {
                        target[item.parent] = [];
                    }
                    if (!target[item.parent][target[item.parent].length - 1]) {
                        target[item.parent].push({});
                    }
                    else if ((!lastParent || item.parent === lastParent) && target[item.parent][target[item.parent].length - 1] && target[item.parent][target[item.parent].length - 1][item.name]) {
                        target[item.parent].push({});
                    }
                    lastParent = item.parent;
                    target = target[item.parent][target[item.parent].length - 1];
                }
            }
            // some fields map to the same name so once we have one stick with it
            target[item.name] || (target[item.name] = metaValue);
        }
        if (tags.length && parsed.open_graph['videos']) {
            // console.log('adding tag arr')
            parsed.open_graph['videos'] = parsed.open_graph['videos'].map(obj => (Object.assign({}, obj, { tags })));
        }
        // console.log('PARSED', '\n', JSON.stringify(parsed, null, 2))
        return parsed;
    };
}
module.exports = unfurl;
