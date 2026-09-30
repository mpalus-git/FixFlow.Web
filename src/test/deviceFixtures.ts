import type { components } from "@/shared/api/schema";

type DeviceResponse = components["schemas"]["DeviceResponse"];
type DeviceListItem = components["schemas"]["DeviceListItemResponse"];

export function createDeviceResponse(overrides: Partial<DeviceResponse> = {}): DeviceResponse {
  return {
    id: "7c1e5b2a-3d4f-4a6b-8c9d-0e1f2a3b4c5d",
    clientId: "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f",
    serialNumber: "SN-2024-0001",
    model: "Vitodens 200-W",
    manufacturer: "Viessmann",
    installationDate: "2024-03-01",
    createdAt: "2026-09-01T08:00:00Z",
    archivedAt: null,
    ...overrides,
  };
}

export function createDeviceListItem(overrides: Partial<DeviceListItem> = {}): DeviceListItem {
  return { ...createDeviceResponse(), clientName: "Piekarnia Kowalski", ...overrides };
}
