import { buildLoginPath, readReturnTo } from "@/shared/lib/returnTo";

describe("readReturnTo", () => {
  it.each(["/clients?page=2#top", "/work-orders?status=New&search=pompa", "/"])(
    "accepts the application path %s",
    (value) => {
      expect(readReturnTo(value)).toBe(value);
    },
  );

  it.each([
    null,
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\\/evil.test",
    "/\t/evil.test",
    "/\n/evil.test",
    "//[",
    "javascript:alert(1)",
    "clients",
    "/login",
    "/login?returnTo=/clients",
  ])("rejects %j", (value) => {
    expect(readReturnTo(value)).toBeNull();
  });

  it("returns the normalized path", () => {
    expect(readReturnTo("/clients/../work-orders")).toBe("/work-orders");
  });
});

describe("buildLoginPath", () => {
  it("keeps the page to return to after logging in", () => {
    expect(buildLoginPath("/clients?page=2")).toBe("/login?returnTo=%2Fclients%3Fpage%3D2");
  });

  it("omits the start page", () => {
    expect(buildLoginPath("/")).toBe("/login");
  });
});
