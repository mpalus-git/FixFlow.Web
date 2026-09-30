import { buildLoginPath, readReturnTo } from "@/shared/lib/returnTo";

describe("readReturnTo", () => {
  it("accepts a path inside the application", () => {
    expect(readReturnTo("/clients?page=2#top")).toBe("/clients?page=2#top");
  });

  it.each([null, "https://evil.test", "//evil.test", "clients", "/login?returnTo=/clients"])(
    "rejects %s",
    (value) => {
      expect(readReturnTo(value)).toBeNull();
    },
  );
});

describe("buildLoginPath", () => {
  it("keeps the page to return to after logging in", () => {
    expect(buildLoginPath("/clients?page=2")).toBe("/login?returnTo=%2Fclients%3Fpage%3D2");
  });

  it("omits the start page", () => {
    expect(buildLoginPath("/")).toBe("/login");
  });
});
