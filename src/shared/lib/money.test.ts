import { formatMoney } from "@/shared/lib/money";

describe("formatMoney", () => {
  it("formats PLN with Polish separators", () => {
    expect(formatMoney(12345.5, "pl")).toBe("12 345,50 zł");
  });

  it("formats PLN in English", () => {
    expect(formatMoney(12345.5, "en")).toBe("PLN 12,345.50");
  });

  it("formats zero", () => {
    expect(formatMoney(0, "pl")).toBe("0,00 zł");
  });
});
