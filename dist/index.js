"use strict";
// to-do: rather than remembering once we have a title. We should wipe
// the title state when we see title tag opened, so we only keep latest title.
// e.g.:
// <title>foo</title>
// <title>bar</title>
// we should take title as 'bar' not 'foo'
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ts-jest already adds source-maps so we don't want to add them again during tests
if (!process.env.disable_source_map) {
    require('source-map-support').install();
}
var url_1 = require("url");
var htmlparser2_1 = require("htmlparser2");
var iconv = require("iconv-lite");
var node_fetch_1 = require("node-fetch");
var unexpectedError_1 = require("./unexpectedError");
var schema_1 = require("./schema");
function unfurl(url, opts) {
    if (opts === undefined) {
        opts = {};
    }
    if (opts.constructor.name !== 'Object') {
        throw new unexpectedError_1.default(unexpectedError_1.default.BAD_OPTIONS);
    }
    // Setting defaults when not provided or not correct type
    typeof opts.oembed === 'boolean' || (opts.oembed = true);
    typeof opts.compress === 'boolean' || (opts.compress = true);
    typeof opts.agent === 'string' || (opts.agent = 'facebookexternalhit');
    Number.isInteger(opts.follow) || (opts.follow = 50);
    Number.isInteger(opts.timeout) || (opts.timeout = 0);
    Number.isInteger(opts.size) || (opts.size = 0);
    var ctx = {
        url: url
    };
    return getPage(url, opts)
        .then(getMetadata(ctx, opts))
        .then(getRemoteMetadata(ctx, opts))
        .then(parse(ctx));
}
function getPage(url, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, buf, ct, str, res, supported, charset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(url, {
                        headers: {
                            Accept: 'text/html, application/xhtml+xml',
                            agent: opts.agent
                        },
                        timeout: opts.timeout,
                        follow: opts.follow,
                        compress: opts.compress,
                        size: opts.size
                    })];
                case 1:
                    resp = _a.sent();
                    return [4 /*yield*/, resp.buffer()];
                case 2:
                    buf = _a.sent();
                    ct = resp.headers.get('Content-Type');
                    if (/text\/html|application\/xhtml+xml/.test(ct) === false) {
                        throw new unexpectedError_1.default(unexpectedError_1.default.EXPECTED_HTML);
                    }
                    str = buf.slice(0, 1024).toString();
                    if (ct) {
                        res = /charset=([^;]*)/i.exec(ct);
                    }
                    // html 5
                    if (!res && str) {
                        res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
                    }
                    // html 4
                    if (!res && str) {
                        res = /<meta.+?content=["'].+;\s?charset=(.+?)["']/i.exec(str);
                    }
                    // found charset
                    if (res) {
                        supported = ['CP932', 'CP936', 'CP949', 'CP950', 'GB2312', 'GBK', 'GB18030', 'BIG5', 'SHIFT_JIS', 'EUC-JP'];
                        charset = res.pop().toUpperCase();
                        if (supported.includes(charset)) {
                            return [2 /*return*/, iconv.decode(buf, charset).toString()];
                        }
                    }
                    return [2 /*return*/, buf.toString()];
            }
        });
    });
}
function getRemoteMetadata(ctx, opts) {
    return function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var target, res, ct, ret, data_1, rez_1, oEmbedMetadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ctx._oembed) {
                            return [2 /*return*/, metadata];
                        }
                        target = url_1.resolve(ctx.url, ctx._oembed.href);
                        return [4 /*yield*/, node_fetch_1.default(target)];
                    case 1:
                        res = _a.sent();
                        ct = res.headers.get('content-type');
                        if (!(ctx._oembed.type === 'application/json+oembed' && /application\/json/.test(ct))) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        ret = _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(ctx._oembed.type === 'text/xml+oembed' && /text\/xml/.test(ct))) return [3 /*break*/, 6];
                        return [4 /*yield*/, res.text()];
                    case 4:
                        data_1 = _a.sent();
                        rez_1 = {};
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var parser = new htmlparser2_1.Parser({
                                    onopentag: function (name, attribs) {
                                        if (this._is_html) {
                                            if (!rez_1.html)
                                                rez_1.html = '';
                                            rez_1.html += "<" + name + " " + Object.entries(attribs).reduce(function (a, _a) {
                                                var k = _a[0], v = _a[1];
                                                return !v ? a + k : a + k + '="' + v + '" ';
                                            }, '').trim() + ">";
                                        }
                                        if (name === 'html') {
                                            this._is_html = true;
                                        }
                                        this._tagname = name;
                                    },
                                    ontext: function (text) {
                                        if (!this._text)
                                            this._text = '';
                                        this._text += text;
                                    },
                                    onclosetag: function (tagname) {
                                        if (tagname === 'oembed') {
                                            return;
                                        }
                                        if (tagname === 'html') {
                                            this._is_html = false;
                                            return;
                                        }
                                        if (this._is_html) {
                                            rez_1.html += this._text.trim();
                                            rez_1.html += "</" + tagname + ">";
                                        }
                                        rez_1[tagname] = this._text.trim();
                                        this._tagname = '';
                                        this._text = '';
                                    },
                                    onend: function () {
                                        resolve(rez_1);
                                    },
                                });
                                parser.write(data_1);
                                parser.end();
                            })];
                    case 5:
                        ret = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!ret) {
                            return [2 /*return*/, metadata];
                        }
                        oEmbedMetadata = Object.entries(ret)
                            .map(function (_a) {
                            var k = _a[0], v = _a[1];
                            return ['oEmbed:' + k, v];
                        })
                            .filter(function (_a) {
                            var k = _a[0], v = _a[1];
                            return schema_1.keys.includes(String(k));
                        }) // to-do: look into why TS complains if i don't String()
                        ;
                        metadata.push.apply(// to-do: look into why TS complains if i don't String()
                        metadata, oEmbedMetadata);
                        return [2 /*return*/, metadata];
                }
            });
        });
    };
}
function getMetadata(ctx, opts) {
    return function (text) {
        var metadata = [];
        return new Promise(function (resolve) {
            var parser = new htmlparser2_1.Parser({
                onend: function () {
                    if (this._favicon !== null) {
                        var favicon = url_1.resolve(ctx.url, '/favicon.ico');
                        metadata.push(['favicon', favicon]);
                    }
                    resolve(metadata);
                },
                onopentagname: function (tag) {
                    this._tagname = tag;
                },
                ontext: function (text) {
                    if (this._tagname === 'title') {
                        // Makes sure we haven't already seen the title
                        if (this._title !== null) {
                            if (this._title === undefined) {
                                this._title = '';
                            }
                            this._title += text;
                        }
                    }
                },
                onopentag: function (name, attr) {
                    if (opts.oembed && attr.href) {
                        // We will handle XML and JSON with a preference towards JSON since its more efficient for us
                        if (attr.type === 'text/xml+oembed' || attr.type === 'application/json+oembed') {
                            if (!ctx._oembed || ctx._oembed.type === 'text/xml+oembed') { // prefer json
                                ctx._oembed = attr;
                            }
                        }
                    }
                    var prop = attr.name || attr.property || attr.rel;
                    var val = attr.content || attr.value;
                    if (this._favicon !== null) {
                        var favicon 
                        // If url is relative we will make it absolute
                        = void 0;
                        // If url is relative we will make it absolute
                        if (attr.rel === 'shortcut icon') {
                            favicon = url_1.resolve(ctx.url, attr.href);
                        }
                        else if (attr.rel === 'icon') {
                            favicon = url_1.resolve(ctx.url, attr.href);
                        }
                        if (favicon) {
                            metadata.push(['favicon', favicon]);
                            this._favicon = null;
                        }
                    }
                    if (prop === 'description') {
                        metadata.push(['description', val]);
                    }
                    if (prop === 'keywords') {
                        metadata.push(['keywords', val]);
                    }
                    if (!prop ||
                        !val ||
                        schema_1.keys.includes(prop) === false) {
                        return;
                    }
                    metadata.push([prop, val]);
                },
                onclosetag: function (tag) {
                    this._tagname = '';
                    // We want to parse as little as possible so finish once we see </head>
                    if (tag === 'head') {
                        parser.reset();
                    }
                    if (tag === 'title' && this._title !== null) {
                        metadata.push(['title', this._title]);
                        this._title = null;
                    }
                }
            }, {
                decodeEntities: true
            });
            parser.write(text);
            parser.end();
        });
    };
}
function parse(ctx) {
    return function (metadata) {
        var parsed = {};
        var tags = [];
        var lastParent;
        for (var _i = 0, metadata_1 = metadata; _i < metadata_1.length; _i++) {
            var _a = metadata_1[_i], metaKey = _a[0], metaValue = _a[1];
            var item = schema_1.schema.get(metaKey);
            if (!item) {
                parsed[metaKey] = metaValue;
                continue;
            }
            // Special case for video tags which we want to map to each video object
            if (metaKey === 'og:video:tag') {
                tags.push(metaValue);
                continue;
            }
            if (item.type === 'string') {
                metaValue = metaValue.toString();
            }
            else if (item.type === 'number') {
                metaValue = parseInt(metaValue, 10);
            }
            else if (item.type === 'url') {
                metaValue = url_1.resolve(ctx.url, metaValue);
            }
            if (parsed[item.entry] === undefined) {
                parsed[item.entry] = {};
            }
            var target = parsed[item.entry];
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
            // some fields map to the same name so once nicwe have one stick with it
            target[item.name] || (target[item.name] = metaValue);
        }
        if (tags.length && parsed.open_graph.videos) {
            parsed.open_graph.videos = parsed.open_graph.videos.map(function (obj) { return (__assign({}, obj, { tags: tags })); });
        }
        return parsed;
    };
}
module.exports = unfurl;
//# sourceMappingURL=index.js.map