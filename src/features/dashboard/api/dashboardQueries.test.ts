import { QueryClient } from "@tanstack/react-query";
import { dashboardKeys, statusCountOf } from "@/features/dashboard/api/dashboardQueries";
import { queryKeyRoots } from "@/shared/api/queryKeyRoots";
import { createDashboardSummary } from "@/test/dashboardFixtures";

describe("dashboardKeys", () => {
  it("marks the summary stale whenever work order lists are invalidated", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(dashboardKeys.summary(), createDashboardSummary());

    await queryClient.invalidateQueries({ queryKey: [...queryKeyRoots.workOrders, "list"] });

    expect(queryClient.getQueryState(dashboardKeys.summary())?.isInvalidated).toBe(true);
  });
});

describe("statusCountOf", () => {
  it("reads the count of a status and treats a missing status as zero", () => {
    const summary = createDashboardSummary({ statusCounts: [{ status: "New", count: 3 }] });

    expect(statusCountOf(summary, "New")).toBe(3);
    expect(statusCountOf(summary, "Invoiced")).toBe(0);
  });
});
