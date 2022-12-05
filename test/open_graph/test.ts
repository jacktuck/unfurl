import { unfurl } from "../../src/";
import nock from "nock";

test("should build videos[]", async () => {
  nock("http://localhost")
    .get("/open_graph/videos")
    .replyWithFile(200, __dirname + "/videos.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/open_graph/videos");
  const expected = {
    videos: [
      {
        url: "https://www.youtube.com/embed/mvSItvjFE1c",
        secure_url: "https://www.youtube.com/embed/mvSItvjFE1c",
        type: "text/html",
        width: 1280,
        height: 720,
        tags: ["Eminem", "Lucky", "You", "Aftermath", "Rap"],
      },
      {
        url: "http://www.youtube.com/v/mvSItvjFE1c?version=3&autohide=1",
        secure_url:
          "https://www.youtube.com/v/mvSItvjFE1c?version=3&autohide=1",
        type: "application/x-shockwave-flash",
        width: 1280,
        height: 720,
        tags: ["Eminem", "Lucky", "You", "Aftermath", "Rap"],
      },
    ],
  };

  expect(result.open_graph).toEqual(expected);
});

test("should build images[]", async () => {
  nock("http://localhost")
    .get("/open_graph/images")
    .replyWithFile(200, __dirname + "/images.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/open_graph/images");
  const expected = {
    images: [
      {
        url: "https://assets-cdn.github.com/images/modules/open_graph/github-logo.png",
        type: "image/png",
        width: 1200,
        height: 1200,
        alt: "The Github logo.",
      },
      {
        url: "https://assets-cdn.github.com/images/modules/open_graph/github-mark.png",
        type: "image/png",
        width: 1200,
        height: 620,
      },
      {
        url: "https://assets-cdn.github.com/images/modules/open_graph/github-octocat.png",
        type: "image/png",
        width: 1200,
        height: 620,
        alt: "The Github octocat.",
      },
    ],
  };

  // (JSON.stringify(result, null, 2))

  expect(result.open_graph).toEqual(expected);
});

test("should build audio[]", async () => {
  nock("http://localhost")
    .get("/open_graph/audio")
    .replyWithFile(200, __dirname + "/audio.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/open_graph/audio");
  const expected = {
    audio: [
      {
        url: "https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02",
        secure_url:
          "https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02",
        type: "audio/vnd.facebook.bridge",
      },
      {
        url: "https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02",
        secure_url:
          "https://p.scdn.co/mp3-preview/2c328a45fe259b5bf58b3ca165984cf8e24a09f1?cid=162b7dc01f3a4a2ca32ed3cec83d1e02",
        type: "audio/vnd.facebook.bridge",
      },
    ],
  };

  // (JSON.stringify(result,null,2))

  expect(result.open_graph).toEqual(expected);
});

test("should quality relative urls", async () => {
  nock("http://localhost")
    .get("/open_graph/relative_url")
    .replyWithFile(200, __dirname + "/relative_url.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/open_graph/relative_url");
  const expected = {
    images: [
      {
        url: "http://localhost/github-logo.png",
      },
      {
        url: "http://localhost/open_graph/github-mark.png",
      },
      {
        url: "http://localhost/github-octocat.png",
      },
    ],
  };

  expect(result.open_graph).toEqual(expected);
});

test("should build article[]", async () => {
  nock("http://localhost")
    .get("/open_graph/article")
    .replyWithFile(200, __dirname + "/article.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/open_graph/article");
  const expected = {
    type: "article",
    articles: [
      {
        published_time: "2021-07-20T05:30:22+00:00",
        modified_time: "2021-07-20T06:30:22+00:00",
        expiration_time: "2021-08-20T05:30:22+00:00",
        author: "abc",
        section: "def",
        tags: ["a", "b", "c"],
      },
    ],
  };

  expect(result.open_graph).toEqual(expected);
});
