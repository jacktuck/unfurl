"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
    require("source-map-support").install();
}
const url_1 = require("url");
const htmlparser2_1 = require("htmlparser2");
const cross_fetch_1 = require("cross-fetch");
const unexpectedError_1 = require("./unexpectedError");
const schema_1 = require("./schema");
const he_1 = require("he");
const iconv_lite_1 = require("iconv-lite");
function unfurl(url, opts) {
    if (opts === undefined) {
        opts = {};
    }
    if (opts.constructor.name !== "Object") {
        throw new unexpectedError_1.default(unexpectedError_1.default.BAD_OPTIONS);
    }
    typeof opts.oembed === "boolean" || (opts.oembed = true);
    typeof opts.compress === "boolean" || (opts.compress = true);
    typeof opts.userAgent === "string" || (opts.userAgent = "facebookexternalhit");
    Number.isInteger(opts.follow) || (opts.follow = 50);
    Number.isInteger(opts.timeout) || (opts.timeout = 0);
    Number.isInteger(opts.size) || (opts.size = 0);
    const ctx = {
        url
    };
    return getPage(url, opts)
        .then(getMetadata(ctx, opts))
        .then(getRemoteMetadata(ctx, opts))
        .then(parse(ctx));
}
exports.unfurl = unfurl;
async function getPage(url, opts) {
    const res = await cross_fetch_1.default(url, {
        headers: {
            Accept: "text/html, application/xhtml+xml",
            "User-Agent": opts.userAgent
        }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("Content-Type");
    const contentLength = res.headers.get("Content-Length");
    if (/text\/html|application\/xhtml+xml/.test(contentType) === false) {
        throw new unexpectedError_1.default(Object.assign(Object.assign({}, unexpectedError_1.default.EXPECTED_HTML), { info: { contentType, contentLength } }));
    }
    // no charset in content type, peek at response body for at most 1024 bytes
    let str = buf.slice(0, 1024).toString();
    let rg;
    if (contentType) {
        rg = /charset=([^;]*)/i.exec(contentType);
    }
    // html 5
    if (!rg && str) {
        rg = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
    }
    // html 4
    if (!rg && str) {
        rg = /<meta.+?content=["'].+;\s?charset=(.+?)["']/i.exec(str);
    }
    // found charset
    if (rg) {
        const supported = ["CP932", "CP936", "CP949", "CP950", "GB2312", "GBK", "GB18030", "BIG5", "SHIFT_JIS", "EUC-JP"];
        const charset = rg.pop().toUpperCase();
        if (supported.includes(charset)) {
            return iconv_lite_1.decode(buf, charset).toString();
        }
    }
    return buf.toString();
}
function getRemoteMetadata(ctx, opts) {
    return async function (metadata) {
        if (!ctx._oembed) {
            return metadata;
        }
        const target = url_1.resolve(ctx.url, he_1.decode(ctx._oembed.href));
        const res = await cross_fetch_1.default(target);
        const contentType = res.headers.get("Content-Type");
        const contentLength = res.headers.get("Content-Length");
        let ret;
        if (ctx._oembed.type === "application/json+oembed" && /application\/json/.test(contentType)) {
            ret = await res.json();
        }
        else if (ctx._oembed.type === "text/xml+oembed" && /text\/xml/.test(contentType)) {
            let data = await res.text();
            let content = {};
            ret = await new Promise((resolve, reject) => {
                const parser = new htmlparser2_1.Parser({
                    onopentag: function (name, attribs) {
                        if (this._is_html) {
                            if (!content.html) {
                                content.html = "";
                            }
                            content.html += `<${name} `;
                            content.html += Object.keys(attribs)
                                .reduce((str, k) => str + (attribs[k] ? `${k}="${attribs[k]}"` : `${k}`) + " ", "")
                                .trim();
                            content.html += ">";
                        }
                        if (name === "html") {
                            this._is_html = true;
                        }
                        this._tagname = name;
                    },
                    ontext: function (text) {
                        if (!this._text)
                            this._text = "";
                        this._text += text;
                    },
                    onclosetag: function (tagname) {
                        if (tagname === "oembed") {
                            return;
                        }
                        if (tagname === "html") {
                            this._is_html = false;
                            return;
                        }
                        if (this._is_html) {
                            content.html += this._text.trim();
                            content.html += `</${tagname}>`;
                        }
                        content[tagname] = this._text.trim();
                        this._tagname = "";
                        this._text = "";
                    },
                    onend: function () {
                        resolve(content);
                    }
                });
                parser.write(data);
                parser.end();
            });
        }
        if (!ret) {
            return metadata;
        }
        const oEmbedMetadata = Object.keys(ret)
            .map(k => ["oEmbed:" + k, ret[k]])
            .filter(([k, v]) => schema_1.keys.includes(String(k)));
        metadata.push(...oEmbedMetadata);
        return metadata;
    };
}
function getMetadata(ctx, opts) {
    return function (text) {
        const metadata = [];
        return new Promise(resolve => {
            const parser = new htmlparser2_1.Parser({
                onend: function () {
                    if (this._favicon === undefined) {
                        metadata.push(["favicon", url_1.resolve(ctx.url, "/favicon.ico")]);
                    }
                    else {
                        metadata.push(["favicon", url_1.resolve(ctx.url, this._favicon)]);
                    }
                    resolve(metadata);
                },
                onopentagname: function (tag) {
                    this._tagname = tag;
                },
                ontext: function (text) {
                    if (this._tagname === "title") {
                        // makes sure we haven't already seen the title
                        if (this._title !== null) {
                            if (this._title === undefined) {
                                this._title = "";
                            }
                            this._title += text;
                        }
                    }
                },
                onopentag: function (tagname, attribs) {
                    if (opts.oembed && attribs.href) {
                        // handle XML and JSON with a preference towards JSON since its more efficient for us
                        if (tagname === "link" &&
                            (attribs.type === "text/xml+oembed" || attribs.type === "application/json+oembed")) {
                            if (!ctx._oembed || ctx._oembed.type === "text/xml+oembed") {
                                // prefer json
                                ctx._oembed = attribs;
                            }
                        }
                    }
                    if (tagname === "link" && attribs.href && (attribs.rel === "icon" || attribs.rel === "shortcut icon")) {
                        this._favicon = attribs.href;
                    }
                    let pair;
                    if (tagname === "meta") {
                        if (attribs.name === "description") {
                            pair = ["description", attribs.content];
                        }
                        else if (attribs.name === "keywords") {
                            let keywords = attribs.content
                                .replace(/^[,\s]{1,}|[,\s]{1,}$/g, "") // gets rid of trailing space or sommas
                                .split(/,{1,}\s{0,}/); // splits on 1+ commas followed by 0+ spaces
                            pair = ["keywords", keywords];
                        }
                        else if (attribs.property && schema_1.keys.includes(attribs.property)) {
                            pair = [attribs.property, attribs.content];
                        }
                        else if (attribs.name && schema_1.keys.includes(attribs.name)) {
                            pair = [attribs.name, attribs.content];
                        }
                    }
                    if (pair) {
                        metadata.push(pair);
                    }
                },
                onclosetag: function (tag) {
                    this._tagname = "";
                    if (tag === "title") {
                        metadata.push(["title", this._title]);
                        this._title = "";
                    }
                    // We want to parse as little as possible so finish once we see </head>
                    if (tag === "head") {
                        parser.reset();
                    }
                }
            });
            parser.write(text);
            parser.end();
        });
    };
}
function parse(ctx) {
    return function (metadata) {
        const parsed = {};
        let tags = [];
        let lastParent;
        for (let [metaKey, metaValue] of metadata) {
            const item = schema_1.schema.get(metaKey);
            // decoding html entities
            if (typeof metaValue === "string") {
                metaValue = he_1.decode(he_1.decode(metaValue.toString()));
            }
            else if (Array.isArray(metaValue)) {
                metaValue = metaValue.map(val => he_1.decode(he_1.decode(val)));
            }
            if (!item) {
                parsed[metaKey] = metaValue;
                continue;
            }
            // special case for video tags which we want to map to each video object
            if (metaKey === "og:video:tag") {
                tags.push(metaValue);
                continue;
            }
            if (item.type === "number") {
                metaValue = parseInt(metaValue, 10);
            }
            else if (item.type === "url" && metaValue) {
                metaValue = url_1.resolve(ctx.url, metaValue);
            }
            if (parsed[item.entry] === undefined) {
                parsed[item.entry] = {};
            }
            let target = parsed[item.entry];
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
                    else if ((!lastParent || item.parent === lastParent) &&
                        target[item.parent][target[item.parent].length - 1] &&
                        target[item.parent][target[item.parent].length - 1][item.name]) {
                        target[item.parent].push({});
                    }
                    lastParent = item.parent;
                    target = target[item.parent][target[item.parent].length - 1];
                }
            }
            // some fields map to the same name so once nicwe have one stick with it
            target[item.name] || (target[item.name] = metaValue);
        }
        if (tags.length && parsed.open_graph.videos) {
            parsed.open_graph.videos = parsed.open_graph.videos.map(obj => (Object.assign(Object.assign({}, obj), { tags })));
        }
        return parsed;
    };
}
//# sourceMappingURL=index.js.map