import createClient from "openapi-fetch";
import type { components, paths } from "@/shared/api/schema";
import { addCalendarDays, todayCalendarDate, toUtcIso } from "@/shared/lib/dateTime";
import { apiUrl, type DemoAccount } from "./environment";

type Schemas = components["schemas"];

export type ApiClient = ReturnType<typeof createClient<paths>>;

function expectData<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.data === undefined) {
    throw new Error(
      `${result.response.url} returned ${String(result.response.status)}: ${JSON.stringify(result.error)}`,
    );
  }
  return result.data;
}

export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

export async function signInToApi(account: DemoAccount): Promise<ApiClient> {
  const anonymous = createClient<paths>({ baseUrl: apiUrl });
  const tokens = expectData(await anonymous.POST("/api/v1/auth/login", { body: account }));
  return createClient<paths>({
    baseUrl: apiUrl,
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
}

export type ClientWithDevice = {
  client: Schemas["ClientResponse"];
  device: Schemas["DeviceResponse"];
};

export async function createClientWithDevice(api: ApiClient): Promise<ClientWithDevice> {
  const suffix = uniqueSuffix();
  const client = expectData(
    await api.POST("/api/v1/clients", {
      body: {
        name: `Klient E2E ${suffix}`,
        address: {
          street: "Testowa",
          buildingNumber: "12",
          postalCode: "00-950",
          city: "Warszawa",
        },
        contactPerson: "Anna Testowa",
        phone: "500 600 700",
      },
    }),
  );
  const device = expectData(
    await api.POST("/api/v1/devices", {
      body: {
        clientId: client.id,
        serialNumber: `E2E-${suffix}`,
        model: "Kocioł E2E",
        manufacturer: "Testowy",
        installationDate: todayCalendarDate(),
      },
    }),
  );
  return { client, device };
}

export function futureWarsawDateTime(daysAhead: number, time = "10:00"): string {
  return `${addCalendarDays(todayCalendarDate(), daysAhead)}T${time}`;
}

export async function createWorkOrder(
  api: ApiClient,
  deviceId: string,
  localDueDate: string,
): Promise<Schemas["WorkOrderResponse"]> {
  return expectData(
    await api.POST("/api/v1/work-orders", {
      body: {
        deviceId,
        description: `Usterka E2E ${uniqueSuffix()}`,
        dueDate: toUtcIso(localDueDate),
        priority: "Normal",
      },
    }),
  );
}

export async function getWorkOrder(
  api: ApiClient,
  workOrderId: string,
): Promise<Schemas["WorkOrderResponse"]> {
  return expectData(
    await api.GET("/api/v1/work-orders/{workOrderId}", { params: { path: { workOrderId } } }),
  );
}
