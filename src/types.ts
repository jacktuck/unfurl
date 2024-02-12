import { HeadersInit } from "node-fetch";
export type Opts = {
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
  /** map of request headers, overrides the defaults */
  headers?: HeadersInit;
  /** Custom fetch implementation */
  fetch?: (url: string) => Promise<any /* Response */>; // eslint-disable-line
};

export type Metadata = {
  title?: string;
  description?: string;
  keywords?: string[];
  favicon?: string;
  author?: string;
  theme_color?: string;
  canonical_url?: string;
  oEmbed?: OEmbedPhoto | OEmbedVideo | OEmbedLink | OEmbedRich;
  twitter_card: {
    card: string;
    site?: string;
    creator?: string;
    creator_id?: string;
    title?: string;
    description?: string;
    players?: {
      url: string;
      stream?: string;
      height?: number;
      width?: number;
    }[];
    apps: {
      iphone: {
        id: string;
        name: string;
        url: string;
      };
      ipad: {
        id: string;
        name: string;
        url: string;
      };
      googleplay: {
        id: string;
        name: string;
        url: string;
      };
    };
    images: {
      url: string;
      alt: string;
    }[];
  };
  open_graph: {
    title: string;
    type: string;
    images?: {
      url: string;
      secure_url?: string;
      type: string;
      width: number;
      height: number;
      alt?: string;
    }[];
    url?: string;
    audio?: {
      url: string;
      secure_url?: string;
      type: string;
    }[];
    description?: string;
    determiner?: string;
    site_name?: string;
    locale: string;
    locale_alt: string;
    videos: {
      url: string;
      stream?: string;
      height?: number;
      width?: number;
      tags?: string[];
    }[];
    article: {
      published_time?: string;
      modified_time?: string;
      expiration_time?: string;
      author?: string;
      section?: string;
      tags?: string[];
    };
  };
};

type OEmbedBase = {
  type: "photo" | "video" | "link" | "rich";
  version: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnails?: [
    {
      url?: string;
      width?: number;
      height?: number;
    }
  ];
};

type OEmbedPhoto = OEmbedBase & {
  type: "photo";
  url: string;
  width: number;
  height: number;
};

type OEmbedVideo = OEmbedBase & {
  type: "video";
  html: string;
  width: number;
  height: number;
};

type OEmbedLink = OEmbedBase & {
  type: "link";
};

type OEmbedRich = OEmbedBase & {
  type: "rich";
  html: string;
  width: number;
  height: number;
};
