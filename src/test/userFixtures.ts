import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createUser } from "@/test/signedInUser";
import { server } from "@/test/server";

type UserResponse = components["schemas"]["UserResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

export const usersUrl = `${apiBaseUrl}/api/v1/users`;

export const signedInAdmin = createUser("Admin");

export const userAccounts: UserResponse[] = [
  signedInAdmin,
  {
    id: "00000000-0000-4000-8000-0000000000a1",
    email: "anna.dyspozytor@fixflow.test",
    role: "Dispatcher",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000a2",
    email: "jan.technik@fixflow.test",
    role: "Technician",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000a3",
    email: "piotr.technik@fixflow.test",
    role: "Technician",
    isActive: false,
  },
];

export function mockUserList(accounts: UserResponse[] = userAccounts) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(usersUrl, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const role = params.get("role");
      const isActive = params.get("isActive");
      const matching = accounts.filter(
        (account) =>
          (role === null || account.role === role) &&
          (isActive === null || String(account.isActive) === isActive),
      );
      const userPage: UserPage = {
        items: matching,
        page: 1,
        pageSize: 20,
        totalCount: matching.length,
      };
      return HttpResponse.json(userPage);
    }),
  );
  return requests;
}
