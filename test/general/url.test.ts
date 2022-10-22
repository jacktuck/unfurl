import { unfurl } from "../../src/";

test("should not throw when provided non-ascii url", async () => {
  expect.assertions(1);

  let err;
  try {
    await unfurl("http://localhost/日本語urlってどうよ");
  } catch (e) {
    err = e;
  } finally {
    expect(err).not.toMatchObject({ code: "ERR_UNESCAPED_CHARACTERS" });
  }
});
