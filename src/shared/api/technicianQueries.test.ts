import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { technicianOptionsQueryOptions } from "@/shared/api/technicianQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createUser } from "@/test/signedInUser";
import { server } from "@/test/server";

type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

describe("technicianOptionsQueryOptions", () => {
  it("asks for active and deactivated technicians on one page", async () => {
    const searchParams: URLSearchParams[] = [];
    const technician = createUser("Technician");
    server.use(
      http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
        searchParams.push(new URL(request.url).searchParams);
        const userPage: UserPage = { items: [technician], page: 1, pageSize: 100, totalCount: 1 };
        return HttpResponse.json(userPage);
      }),
    );

    const technicians = await new QueryClient().query(technicianOptionsQueryOptions());

    expect(technicians).toEqual([technician]);
    expect(Object.fromEntries(searchParams[0] ?? [])).toEqual({
      role: "Technician",
      pageSize: "100",
    });
  });
});
