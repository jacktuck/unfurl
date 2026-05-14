/**
 * SSRF guard — resolves a URL's hostname and rejects requests targeting
 * private, loopback, link-local, or otherwise unsafe IP ranges.
 *
 * Used to prevent attackers from coercing unfurl into making HTTP requests
 * to internal infrastructure (cloud metadata endpoints, internal APIs,
 * private network services, etc).
 */

import { URL } from "url";
import nodeFetch, { RequestInit, Response } from "node-fetch";
import { promises as dns } from "dns";
import { isIP } from "net";

export class SSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SSRFError";
  }
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Returns true if the given IP address is in a range that should not be
 * reachable from a public-input URL fetcher. Covers IPv4 and IPv6.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  const family = isIP(ip);
  if (family === 0) return false;
  ip = ip.toLowerCase();

  if (family === 4) {
    const [a, b] = ip.split(".").map((p) => parseInt(p, 10));

    // 0.0.0.0/8 — current network
    if (a === 0) return true;
    // 10.0.0.0/8 — private
    if (a === 10) return true;
    // 127.0.0.0/8 — loopback
    if (a === 127) return true;
    // 169.254.0.0/16 — link-local (includes cloud metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 — private
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24, 192.0.2.0/24 — reserved/documentation
    if (a === 192 && b === 0) return true;
    // 192.168.0.0/16 — private
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15 — benchmarking
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24 — documentation
    if (a === 198 && b === 51) return true;
    // 203.0.113.0/24 — documentation
    if (a === 203 && b === 0) return true;
    // 224.0.0.0/4 — multicast
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 — reserved (includes 255.255.255.255 broadcast)
    if (a >= 240) return true;

    return false;
  }

  // IPv6
  // Loopback ::1
  if (ip === "::1") return true;
  // Unspecified ::
  if (ip === "::") return true;
  // IPv4-mapped IPv6 (::ffff:x.x.x.x) — recurse on the embedded v4
  const v4MappedMatch = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4MappedMatch) return isPrivateOrReservedIP(v4MappedMatch[1]);
  // Unique local fc00::/7
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
  // Link-local fe80::/10
  if (
    ip.startsWith("fe8") ||
    ip.startsWith("fe9") ||
    ip.startsWith("fea") ||
    ip.startsWith("feb")
  )
    return true;
  // Multicast ff00::/8
  if (ip.startsWith("ff")) return true;

  return false;
}

/**
 * Validates that a URL is safe to fetch from a public-input link-preview
 * context: must be http(s) and must not resolve to a private/reserved IP.
 *
 * Throws SSRFError if the URL fails any check. Resolves silently if safe.
 */
export async function assertSafeURL(
  rawUrl: string,
  allowPrivateIPs = false
): Promise<void> {
  if (allowPrivateIPs) return;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SSRFError(`Invalid URL: ${rawUrl}`);
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new SSRFError(`Disallowed protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new SSRFError("URL has no hostname");
  }

  // If the hostname is already a literal IP, validate it directly.
  if (isIP(hostname) !== 0) {
    if (isPrivateOrReservedIP(hostname)) {
      throw new SSRFError(`Disallowed destination IP: ${hostname}`);
    }
    return;
  }

  // Otherwise resolve all addresses and reject if ANY resolve to a
  // forbidden range. (Defense against DNS responses with mixed records.)
  let addresses: { address: string; family: number }[];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    throw new SSRFError(
      `Failed to resolve ${hostname}: ${(err as Error).message}`
    );
  }

  if (addresses.length === 0) {
    throw new SSRFError(`No addresses resolved for ${hostname}`);
  }

  for (const { address } of addresses) {
    if (isPrivateOrReservedIP(address)) {
      throw new SSRFError(
        `Hostname ${hostname} resolves to disallowed IP ${address}`
      );
    }
  }
}

/**
 * Wraps node-fetch with manual redirect handling so that each redirect
 * target is re-validated against the SSRF guard. node-fetch's automatic
 * redirect-following bypasses any one-shot pre-fetch validation, so we
 * have to walk the chain ourselves.
 */
export async function safeFetch(
  initialUrl: string,
  init: RequestInit & { follow?: number; allowPrivateIPs?: boolean } = {}
): Promise<Response> {
  const maxRedirects = typeof init.follow === "number" ? init.follow : 20;
  const allowPrivateIPs = init.allowPrivateIPs === true;

  // Strip our custom keys before passing to node-fetch.
  delete init.follow;
  delete init.allowPrivateIPs;

  let currentUrl = initialUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertSafeURL(currentUrl, allowPrivateIPs);

    const res = await nodeFetch(currentUrl, {
      ...init,
      redirect: "manual",
    });

    // Not a redirect — return as-is.
    if (res.status < 300 || res.status >= 400) {
      return res;
    }

    const location = res.headers.get("location");
    if (!location) {
      // Redirect status with no Location header — return what we got.
      return res;
    }

    // Resolve relative redirects against the URL that produced them.
    currentUrl = new URL(location, currentUrl).href;
  }

  throw new SSRFError(`Too many redirects (>${maxRedirects})`);
}
