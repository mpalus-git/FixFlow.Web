import type { components } from "@/shared/api/schema";

type ClientResponse = components["schemas"]["ClientResponse"];

export function createClientResponse(overrides: Partial<ClientResponse> = {}): ClientResponse {
  return {
    id: "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f",
    name: "Piekarnia Kowalski",
    address: {
      street: "Mariacka",
      buildingNumber: "12A",
      postalCode: "40-014",
      city: "Katowice",
    },
    contactPerson: "Jan Kowalski",
    phone: "+48 600 100 200",
    email: "biuro@piekarnia.test",
    createdAt: "2026-09-01T08:00:00Z",
    archivedAt: null,
    ...overrides,
  };
}
