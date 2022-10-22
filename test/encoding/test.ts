import { unfurl } from "../../src/";

import nock from "nock";

test("should detect GB2312 charset (HTML 4) and convert to UTF-8", async () => {
  nock("http://localhost")
    .get("/html4/gb2312")
    .replyWithFile(200, __dirname + "/html_4.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/html4/gb2312");

  const expected = {
    description:
      "腾讯网从2003年创立至今，已经成为集新闻信息，区域垂直生活服务、社会化媒体资讯和产品为一体的互联网媒体平台。腾讯网下设新闻、科技、财经、娱乐、体育、汽车、时尚等多个频道，充分满足用户对不同类型资讯的需求。同时专注不同领域内容，打造精品栏目，并顺应技术发展趋势，推出网络直播等创新形式，改变了用户获取资讯的方式和习惯。",
    favicon: "http://mat1.gtimg.com/www/icon/favicon2.ico",
    title: "腾讯首页",
  };

  expect(result).toEqual(expected);
});

test("should detect GB2312 charset (HTML 5) and convert to UTF-8", async () => {
  nock("http://localhost")
    .get("/html5/gb2312")
    .replyWithFile(200, __dirname + "/html_5.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/html5/gb2312");

  const expected = {
    description:
      "腾讯网从2003年创立至今，已经成为集新闻信息，区域垂直生活服务、社会化媒体资讯和产品为一体的互联网媒体平台。腾讯网下设新闻、科技、财经、娱乐、体育、汽车、时尚等多个频道，充分满足用户对不同类型资讯的需求。同时专注不同领域内容，打造精品栏目，并顺应技术发展趋势，推出网络直播等创新形式，改变了用户获取资讯的方式和习惯。",
    favicon: "http://mat1.gtimg.com/www/icon/favicon2.ico",
    title: "腾讯首页",
  };

  expect(result).toEqual(expected);
});

test("should detect EUC-JP charset (HTML 5) and convert to UTF-8", async () => {
  nock("http://localhost")
    .get("/html5/euc-jp")
    .replyWithFile(200, __dirname + "/euc-jp.html", {
      "Content-Type": "text/html",
    });

  const result = await unfurl("http://localhost/html5/euc-jp");

  const expected = {
    description:
      "楽天市場はインターネット通販が楽しめる総合ショッピングモール。楽天スーパーポイントがどんどん貯まる！使える！毎日お得なクーポンも。あす楽利用で翌日にお届け。食品から家電、ファッション、ベビー用品、コスメまで、充実の品揃え。",
    favicon: "http://localhost/favicon.ico",
    keywords: [
      "通販",
      "インターネット通販",
      "オンラインショッピング",
      "楽天",
      "楽天市場",
      "rakuten",
      "ラクテン",
      "らくてん",
    ],
    open_graph: {
      description:
        "楽天市場はインターネット通販が楽しめる総合ショッピングモール。楽天スーパーポイントがどんどん貯まる！使える！毎日お得なクーポンも。あす楽利用で翌日にお届け。食品から家電、ファッション、ベビー用品、コスメまで、充実の品揃え。",
      images: [
        {
          url: "https://r.r10s.jp/com/inc/home/20080930/spt/common/img/20180702_ogp.png",
        },
      ],
      site_name: "楽天市場",
      title:
        "【楽天市場】Shopping is Entertainment! ： インターネット最大級の通信販売、通販オンラインショッピングコミュニティ",
      type: "website",
      url: "https://www.rakuten.co.jp/",
    },
    title:
      "【楽天市場】Shopping is Entertainment! ： インターネット最大級の通信販売、通販オンラインショッピングコミュニティ",
    twitter_card: {
      card: "summary",
      description:
        "楽天市場はインターネット通販が楽しめる総合ショッピングモール。楽天スーパーポイントがどんどん貯まる！使える！毎日お得なクーポンも。あす楽利用で翌日にお届け。食品から家電、ファッション、ベビー用品、コスメまで、充実の品揃え。",
      images: [
        {
          url: "https://r.r10s.jp/com/inc/home/20080930/spt/common/img/20180702_ogp.png",
        },
      ],
      site: "@RakutenJP",
      title:
        "【楽天市場】Shopping is Entertainment! ： インターネット最大級の通信販売、通販オンラインショッピングコミュニティ",
    },
  };

  expect(result).toEqual(expected);
});
