import { unfurl } from "../../src/";
import nock from "nock";

test("should noop and not throw for wrong content type", async () => {
  nock("http://localhost").get("/oembed/image.png").reply(200, "", {
    "Content-Type": "image/png",
  });

  nock("http://localhost")
    .get("/html/oembed-broken")
    .replyWithFile(200, __dirname + "/oembed-broken.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/html/oembed-broken");

  expect(result.oEmbed).toEqual(undefined);
});

test("width/height should be numbers", async () => {
  nock("http://localhost")
    .get("/html/oembed")
    .replyWithFile(200, __dirname + "/oembed.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/json/oembed.json")
    .replyWithFile(200, __dirname + "/oembed.json", {
      "Content-Type": "application/json",
    });

  const result = await unfurl("http://localhost/html/oembed");

  expect(result.oEmbed?.type).toEqual("video");
  const oEmbed =
    result.oEmbed?.type === "video" ? result.oEmbed : (result.oEmbed as never);

  expect(oEmbed.width).toEqual(640);
  expect(oEmbed.height).toEqual(640);

  expect(oEmbed.thumbnails?.[0].width).toEqual(200);
  expect(oEmbed.thumbnails?.[0].height).toEqual(200);
});

test("should decode entities in OEmbed URL", async () => {
  nock("http://localhost")
    .get("/html/oembed")
    .replyWithFile(200, __dirname + "/oembed-entities.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/oembed-service?format=json&file=/json/oembed.json")
    .replyWithFile(200, __dirname + "/oembed.json", {
      "Content-Type": "application/json",
    });

  const result = await unfurl("http://localhost/html/oembed");

  expect(result.oEmbed?.type).toEqual("video");
  const oEmbed =
    result.oEmbed?.type === "video" ? result.oEmbed : (result.oEmbed as never);

  expect(oEmbed.width).toEqual(640);
  expect(oEmbed.height).toEqual(640);

  expect(oEmbed.thumbnails?.[0].width).toEqual(200);
  expect(oEmbed.thumbnails?.[0].height).toEqual(200);
});

test("should prefer fetching JSON oEmbed", async () => {
  nock("http://localhost")
    .get("/html/oembed-multi")
    .replyWithFile(200, __dirname + "/oembed-multi.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/json/oembed.json")
    .replyWithFile(200, __dirname + "/oembed.json", {
      "Content-Type": "application/json",
    });

  const result = await unfurl("http://localhost/html/oembed-multi");

  const expected = {
    version: "1.0",
    provider_url: "https://gfycat.com",
    provider_name: "Gfycat",
    type: "video",
    title: "The creation of a marble sculpture",
    html: `<div style='position:relative;padding-bottom:100.0%'><iframe src='https://gfycat.com/ifr/ImpressionableWaterloggedAbalone' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div>`,
    height: 640,
    width: 640,
    thumbnails: [
      {
        url: "https://gfycat.com/uk/gifs/detail/impressionablewaterloggedabalone",
        width: 200,
        height: 200,
      },
    ],
  };

  expect(result.oEmbed).toEqual(expected);
});

test("should upgrade to HTTPS if needed", async () => {
  nock("http://localhost")
    .get("/html/oembed-http")
    .replyWithFile(200, __dirname + "/oembed-http.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/json/oembed.json")
    .replyWithFile(403, __dirname + "/oembed-error.json", {
      "Content-Type": "application/json",
    });

  nock("https://localhost")
    .get("/json/oembed.json")
    .replyWithFile(200, __dirname + "/oembed.json", {
      "Content-Type": "application/json",
    });

  const result = await unfurl("http://localhost/html/oembed-http");

  expect(result.oEmbed?.version).toEqual("1.0");
});

test("should build oEmbed from JSON", async () => {
  nock("http://localhost")
    .get("/html/oembed")
    .replyWithFile(200, __dirname + "/oembed.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/json/oembed.json")
    .replyWithFile(200, __dirname + "/oembed.json", {
      "Content-Type": "application/json",
    });

  const result = await unfurl("http://localhost/html/oembed");

  const expected = {
    version: "1.0",
    provider_url: "https://gfycat.com",
    provider_name: "Gfycat",
    type: "video",
    title: "The creation of a marble sculpture",
    html: `<div style='position:relative;padding-bottom:100.0%'><iframe src='https://gfycat.com/ifr/ImpressionableWaterloggedAbalone' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div>`,
    height: 640,
    width: 640,
    thumbnails: [
      {
        url: "https://gfycat.com/uk/gifs/detail/impressionablewaterloggedabalone",
        width: 200,
        height: 200,
      },
    ],
  };

  expect(result.oEmbed).toEqual(expected);
});

test("should build oEmbed from XML", async () => {
  nock("http://localhost")
    .get("/html/oembed-xml")
    .replyWithFile(200, __dirname + "/oembed-xml.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/xml/oembed.xml")
    .replyWithFile(200, __dirname + "/oembed.xml", {
      "Content-Type": "text/xml",
    });

  const result = await unfurl("http://localhost/html/oembed-xml");

  const expected = {
    html: '<iframe width="480" height="270" src="https://www.youtube.com/embed/mvSItvjFE1c?feature=oembed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
    author_name: "EminemVEVO",
    author_url: "https://www.youtube.com/user/EminemVEVO",
    height: 270,
    provider_name: "YouTube",
    provider_url: "https://www.youtube.com/",
    thumbnails: [
      {
        height: 360,
        url: "https://i.ytimg.com/vi/mvSItvjFE1c/hqdefault.jpg",
        width: 480,
      },
    ],
    title: "Eminem - Lucky You ft. Joyner Lucas",
    type: "video",
    version: "1.0",
    width: 480,
  };

  expect(result.oEmbed).toEqual(expected);
});

test("should build oEmbed from XML with CDATA", async () => {
  nock("http://localhost")
    .get("/html/oembed-xml-cdata")
    .replyWithFile(200, __dirname + "/oembed-xml-cdata.html", {
      "Content-Type": "text/html",
    });

  nock("http://localhost")
    .get("/xml/oembed-cdata.xml")
    .replyWithFile(200, __dirname + "/oembed-cdata.xml", {
      "Content-Type": "text/xml",
    });

  const result = await unfurl("http://localhost/html/oembed-xml-cdata");

  const expected = {
    height: 450,
    title: "The Bugle",
    type: "rich",
    version: "1.0",
    width: 100,
    html: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F9818871&show_artwork=true"></iframe>',
  };

  expect(result.oEmbed).toEqual(expected);
});
