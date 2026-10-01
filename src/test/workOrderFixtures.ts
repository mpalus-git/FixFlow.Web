import type { components } from "@/shared/api/schema";

type WorkOrderListItem = components["schemas"]["WorkOrderListItemResponse"];
type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];

export function createWorkOrderListItem(
  overrides: Partial<WorkOrderListItem> = {},
): WorkOrderListItem {
  return {
    id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a",
    deviceId: "7c1e5b2a-3d4f-4a6b-8c9d-0e1f2a3b4c5d",
    deviceSerialNumber: "SN-2024-0001",
    deviceModel: "Vitodens 200-W",
    clientId: "3f1d2c4b-5a69-4e7d-8c1b-2a3b4c5d6e7f",
    clientName: "Piekarnia Kowalski",
    description: "Kocioł nie grzeje wody użytkowej",
    priority: "High",
    status: "Assigned",
    technicianId: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
    technicianEmail: "technician@fixflow.test",
    dueDate: "2026-07-15T22:30:00Z",
    isOverdue: false,
    createdAt: "2026-07-10T08:00:00Z",
    startedAt: null,
    completedAt: null,
    invoicedAt: null,
    ...overrides,
  };
}

export function createWorkOrderResponse(
  overrides: Partial<WorkOrderResponse> = {},
): WorkOrderResponse {
  return {
    id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a",
    deviceId: "7c1e5b2a-3d4f-4a6b-8c9d-0e1f2a3b4c5d",
    description: "Kocioł nie grzeje wody użytkowej",
    priority: "High",
    status: "New",
    technicianId: null,
    dueDate: "2026-07-15T22:30:00Z",
    isOverdue: false,
    createdAt: "2026-07-10T08:00:00Z",
    startedAt: null,
    completedAt: null,
    invoicedAt: null,
    ...overrides,
  };
}
