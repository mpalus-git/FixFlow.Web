import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { type UserListFilters, userListQueryOptions } from "@/features/users/api/userQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { server } from "@/test/server";

type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

async function requestListWith(filters: UserListFilters) {
  const queries: Record<string, string>[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      const userPage: UserPage = { items: [], page: 2, pageSize: 20, totalCount: 0 };
      return HttpResponse.json(userPage);
    }),
  );
  await new QueryClient().query(userListQueryOptions({ page: 2, filters }));
  return queries;
}

describe("userListQueryOptions", () => {
  it("sends the page and leaves out filters that are not set", async () => {
    expect(await requestListWith({ role: null, isActive: null })).toEqual([
      { page: "2", pageSize: "20" },
    ]);
  });

  it("filters by role and deactivated accounts", async () => {
    expect(await requestListWith({ role: "Technician", isActive: false })).toEqual([
      { page: "2", pageSize: "20", role: "Technician", isActive: "false" },
    ]);
  });
});
