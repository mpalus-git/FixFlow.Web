import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type DashboardSummaryResponse = components["schemas"]["DashboardSummaryResponse"];

export const dashboardSummaryUrl = `${apiBaseUrl}/api/v1/dashboard/summary`;

export function createDashboardSummary(
  overrides: Partial<DashboardSummaryResponse> = {},
): DashboardSummaryResponse {
  return {
    generatedAt: "2026-10-01T08:30:00Z",
    weekStart: "2026-09-28",
    weekEnd: "2026-10-04",
    statusCounts: [
      { status: "New", count: 3 },
      { status: "Assigned", count: 5 },
      { status: "InProgress", count: 2 },
      { status: "Completed", count: 4 },
      { status: "Invoiced", count: 9 },
    ],
    overdueCount: 1,
    outOfStockPartCount: 1,
    technicians: [
      {
        technicianId: "00000000-0000-4000-8000-0000000000a2",
        email: "anna.kowalczyk@fixflow.test",
        fullName: "Anna Kowalczyk",
        assignedCount: 3,
        inProgressCount: 1,
        overdueCount: 1,
        dueThisWeekCount: 2,
      },
      {
        technicianId: "00000000-0000-4000-8000-0000000000a3",
        email: "tomasz.wojcik@fixflow.test",
        fullName: "Tomasz Wójcik",
        assignedCount: 2,
        inProgressCount: 1,
        overdueCount: 0,
        dueThisWeekCount: 1,
      },
    ],
    ...overrides,
  };
}

export function mockDashboardSummary(summary: DashboardSummaryResponse = createDashboardSummary()) {
  let requestCount = 0;
  server.use(
    http.get(dashboardSummaryUrl, () => {
      requestCount += 1;
      return HttpResponse.json(summary);
    }),
  );
  return () => requestCount;
}
