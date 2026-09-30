import { readPageParam } from "@/shared/lib/useListSearchParams";

describe("readPageParam", () => {
  it("reads a positive page number", () => {
    expect(readPageParam("4")).toBe(4);
  });

  it.each([null, "", "0", "-2", "1.5", "abc", "99999999999999999999"])(
    "falls back to the first page for %s",
    (value) => {
      expect(readPageParam(value)).toBe(1);
    },
  );
});
