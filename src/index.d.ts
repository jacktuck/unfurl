import 'source-map-support/register';
declare type Opts = {
    /** support retreiving oembed metadata */
    oembed?: boolean;
    /** req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies) */
    timeout?: number;
    /** maximum redirect count. 0 to not follow redirect */
    follow?: number;
    /** support gzip/deflate content encoding */
    compress?: boolean;
    /** maximum response body size in bytes. 0 to disable */
    size?: number;
    /** http(s).Agent instance, allows custom proxy, certificate, lookup, family etc. */
    agent?: string | null;
};
declare function unfurl(url: string, opts?: Opts): Promise<{
    twitter_card: {};
    open_graph: {};
    oEmbed: {};
}>;
export default unfurl;
