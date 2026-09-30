import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

export function mockEmptyClientCardLists() {
  const devicePage: DevicePage = { items: [], page: 1, pageSize: 10, totalCount: 0 };
  const workOrderPage: WorkOrderPage = { items: [], page: 1, pageSize: 10, totalCount: 0 };
  server.use(
    http.get(`${apiBaseUrl}/api/v1/devices`, () => HttpResponse.json(devicePage)),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, () => HttpResponse.json(workOrderPage)),
  );
}
