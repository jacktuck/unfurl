import { unfurl } from "../../src";
import nock from "nock";
import UnexpectedError from "../../src/unexpectedError";

test("should throw if status code not 200", () => {
  nock("http://localhost").get("/html/return-404").reply(404);

  return expect(unfurl("http://localhost/html/return-404")).rejects.toThrow(
    new UnexpectedError(UnexpectedError.BAD_HTTP_STATUS)
  );
});

test("should not throw if status code is 200", async () => {
  nock("http://localhost").get("/html/return-200").reply(200, "", {
    "Content-Type": "text/html",
  });

  return expect(
    unfurl("http://localhost/html/return-200")
  ).resolves.toBeTruthy();
});
