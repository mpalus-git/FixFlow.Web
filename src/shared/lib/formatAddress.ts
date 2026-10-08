import type { components } from "@/shared/api/schema";

type ClientAddress = components["schemas"]["ClientAddress"];

export function formatAddress({ street, buildingNumber, postalCode, city }: ClientAddress): string {
  return `${street} ${buildingNumber}, ${postalCode} ${city}`;
}
