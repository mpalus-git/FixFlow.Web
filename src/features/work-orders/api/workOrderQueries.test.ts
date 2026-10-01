import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import {
  serviceEntriesQueryOptions,
  workOrderListQueryOptions,
} from "@/features/work-orders/api/workOrderQueries";
import type { WorkOrderListParams } from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";
import { createServiceEntryResponse } from "@/test/workOrderFixtures";

type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];

const workOrdersUrl = `${apiBaseUrl}/api/v1/work-orders`;

const noFilters: WorkOrderListParams = {
  page: 1,
  search: "",
  filters: { status: null, technicianId: null, dueFrom: null, dueTo: null, overdueOnly: false },
  sort: { sortBy: "DueDate", sortDirection: "Asc" },
};

async function requestListWith(params: WorkOrderListParams) {
  const searchParams: URLSearchParams[] = [];
  server.use(
    http.get(workOrdersUrl, ({ request }) => {
      searchParams.push(new URL(request.url).searchParams);
      const workOrderPage: WorkOrderPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
      return HttpResponse.json(workOrderPage);
    }),
  );
  await new QueryClient().query(workOrderListQueryOptions(params));
  return Object.fromEntries(searchParams[0] ?? []);
}

describe("workOrderListQueryOptions", () => {
  it("sends only the page and sorting when no filter is set", async () => {
    expect(await requestListWith(noFilters)).toEqual({
      page: "1",
      pageSize: "20",
      sortBy: "DueDate",
      sortDirection: "Asc",
    });
  });

  it("sends every set filter with the names the API expects", async () => {
    const query = await requestListWith({
      page: 2,
      search: "kocioł",
      filters: {
        status: "Assigned",
        technicianId: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
        dueFrom: "2026-10-01",
        dueTo: "2026-10-07",
        overdueOnly: true,
      },
      sort: { sortBy: "Priority", sortDirection: "Desc" },
    });

    expect(query).toEqual({
      page: "2",
      pageSize: "20",
      search: "kocioł",
      status: "Assigned",
      technicianId: "0b6f0c9e-0d6e-4a57-9d55-6a1f3f0f2a10",
      dueFrom: "2026-10-01",
      dueTo: "2026-10-07",
      isOverdue: "true",
      sortBy: "Priority",
      sortDirection: "Desc",
    });
  });
});

describe("serviceEntriesQueryOptions", () => {
  it("loads all service entries of the work order", async () => {
    const entry = createServiceEntryResponse();
    server.use(
      http.get(`${workOrdersUrl}/${entry.workOrderId}/service-entries`, () =>
        HttpResponse.json([entry]),
      ),
    );

    const entries = await new QueryClient().query(serviceEntriesQueryOptions(entry.workOrderId));

    expect(entries).toEqual([entry]);
  });
});
