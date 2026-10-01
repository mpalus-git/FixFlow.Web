import type { components } from "@/shared/api/schema";

type PartResponse = components["schemas"]["PartResponse"];

export function createPartResponse(overrides: Partial<PartResponse> = {}): PartResponse {
  return {
    id: "8e7d6c5b-4a39-4281-9f0e-1d2c3b4a5f6e",
    name: "Czujnik ciśnienia wody",
    catalogNumber: "VIE-7828749",
    stockQuantity: 12,
    unitPrice: 148.5,
    createdAt: "2026-09-01T08:00:00Z",
    archivedAt: null,
    ...overrides,
  };
}
