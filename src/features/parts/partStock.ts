export const lowStockThreshold = 5;

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(stockQuantity: number): StockLevel {
  if (stockQuantity <= 0) {
    return "out";
  }
  return stockQuantity <= lowStockThreshold ? "low" : "ok";
}
