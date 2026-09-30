import { readStorage, removeStorage, writeStorage } from "@/shared/lib/storage";

describe("storage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("reads a value written earlier", () => {
    expect(writeStorage("key", "value")).toBe(true);

    expect(readStorage("key")).toBe("value");
  });

  it("returns null when reading from unavailable storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(readStorage("key")).toBeNull();
  });

  it("returns false when writing to unavailable storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(writeStorage("key", "value")).toBe(false);
  });

  it("removes a stored value", () => {
    writeStorage("key", "value");

    removeStorage("key");

    expect(readStorage("key")).toBeNull();
  });

  it("ignores removal from unavailable storage", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(() => {
      removeStorage("key");
    }).not.toThrow();
  });
});
