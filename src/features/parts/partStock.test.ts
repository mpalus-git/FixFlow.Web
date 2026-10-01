import { lowStockThreshold, stockLevel } from "@/features/parts/partStock";

describe("stockLevel", () => {
  it.each([
    [0, "out"],
    [1, "low"],
    [lowStockThreshold, "low"],
    [lowStockThreshold + 1, "ok"],
  ] as const)("treats a stock of %i units as %s", (stockQuantity, level) => {
    expect(stockLevel(stockQuantity)).toBe(level);
  });
});
