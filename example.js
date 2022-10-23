const http = require("http");
const { parse } = require("url");
const { unfurl } = require("./dist");

http
  .createServer(function (req, res) {
    const isUrl = /https?:\/\//;
    const { url } = parse(req.url, true).query;

    if (!url) {
      res.writeHead(400, "Please submit a url with querystring");
      res.end();
      return;
    }

    if (!isUrl.test(url)) {
      res.writeHead(400, "Please only submit http(s) urls");
      res.end();
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
    );

    unfurl(url)
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(data));
      })
      .catch((err) => {
        console.error(err);
        res.writeHead(500, err);
        res.end();
      });
  })
  .listen(process.env.PORT || 3000); //eslint-disable-line
