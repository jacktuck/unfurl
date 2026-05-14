import {
  assertSafeURL,
  isPrivateOrReservedIP,
  SSRFError,
  safeFetch,
} from "../../src/ssrfGuard";
import { unfurl } from "../../src/index";
import nock from "nock";

describe("isPrivateOrReservedIP", () => {
  test.each([
    ["127.0.0.1", true],
    ["10.0.0.1", true],
    ["10.255.255.255", true],
    ["172.16.0.1", true],
    ["172.31.255.255", true],
    ["192.168.1.1", true],
    ["169.254.169.254", true], // AWS metadata
    ["0.0.0.0", true],
    ["255.255.255.255", true],
    ["224.0.0.1", true], // multicast
    ["::1", true], // IPv6 loopback
    ["fe80::1", true], // IPv6 link-local
    ["fc00::1", true], // IPv6 unique local
    ["::ffff:127.0.0.1", true], // IPv4-mapped IPv6
  ])("rejects private/reserved IP %s", (ip, expected) => {
    expect(isPrivateOrReservedIP(ip)).toBe(expected);
  });

  test.each([
    ["8.8.8.8", false],
    ["1.1.1.1", false],
    ["172.15.0.1", false], // just outside private range
    ["172.32.0.1", false], // just outside private range
    ["2606:4700:4700::1111", false], // Cloudflare DNS
  ])("allows public IP %s", (ip, expected) => {
    expect(isPrivateOrReservedIP(ip)).toBe(expected);
  });
});

describe("assertSafeURL", () => {
  test("rejects loopback literal", async () => {
    await expect(assertSafeURL("http://127.0.0.1/foo")).rejects.toThrow(
      SSRFError
    );
  });

  test("rejects AWS metadata IP", async () => {
    await expect(
      assertSafeURL("http://169.254.169.254/latest/meta-data/")
    ).rejects.toThrow(SSRFError);
  });

  test("rejects private IP", async () => {
    await expect(assertSafeURL("http://192.168.1.1/admin")).rejects.toThrow(
      SSRFError
    );
  });

  test("rejects file:// protocol", async () => {
    await expect(assertSafeURL("file:///etc/passwd")).rejects.toThrow(
      SSRFError
    );
  });

  test("rejects gopher:// protocol", async () => {
    await expect(assertSafeURL("gopher://localhost/")).rejects.toThrow(
      SSRFError
    );
  });

  test("rejects malformed URL", async () => {
    await expect(assertSafeURL("not a url")).rejects.toThrow(SSRFError);
  });

  test("allows public hostname", async () => {
    await expect(assertSafeURL("https://example.com")).resolves.toBeUndefined();
  });

  test("rejects localhost hostname (resolves to loopback)", async () => {
    await expect(assertSafeURL("http://localhost/")).rejects.toThrow(SSRFError);
  });
});

describe("unfurl SSRF integration", () => {
  test("unfurl rejects direct loopback", async () => {
    await expect(unfurl("http://127.0.0.1:8080")).rejects.toThrow(SSRFError);
  });

  test("unfurl rejects AWS metadata endpoint", async () => {
    await expect(
      unfurl(
        "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
      )
    ).rejects.toThrow(SSRFError);
  });
});

describe("safeFetch redirect handling", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test("follows redirects when validation is bypassed", async () => {
    nock("http://localhost")
      .get("/hop1")
      .reply(302, "", { Location: "http://localhost/hop2" })
      .get("/hop2")
      .reply(200, "ok");

    const res = await safeFetch("http://localhost/hop1", {
      allowPrivateIPs: true,
    });
    expect(res.status).toBe(200);
  });

  test("rejects too many redirects", async () => {
    nock("http://localhost")
      .get("/loop")
      .times(25)
      .reply(302, "", { Location: "http://localhost/loop" });

    await expect(
      safeFetch("http://localhost/loop", { allowPrivateIPs: true, follow: 3 })
    ).rejects.toThrow(SSRFError);
  });
});
