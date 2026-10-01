import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { formatMoney } from "@/shared/lib/money";
import { endSession } from "@/shared/session/sessionStore";
import { createPartResponse } from "@/test/partFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type PartResponse = components["schemas"]["PartResponse"];
type PartPage = components["schemas"]["PagedResponseOfPartResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const partsUrl = `${apiBaseUrl}/api/v1/parts`;

const parts: PartResponse[] = [
  createPartResponse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "Czynnik chłodniczy R32",
    catalogNumber: "REF-R32-1KG",
    stockQuantity: 25,
    unitPrice: 89.9,
  }),
  createPartResponse({
    id: "00000000-0000-4000-8000-000000000002",
    name: "Filtr powietrza",
    catalogNumber: "FLT-AC-100",
    stockQuantity: 3,
    unitPrice: 45,
  }),
  createPartResponse({
    id: "00000000-0000-4000-8000-000000000003",
    name: "Kondensator rozruchowy",
    catalogNumber: "CAP-35UF",
    stockQuantity: 0,
    unitPrice: 38.5,
  }),
];

function mockPartList() {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(partsUrl, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const search = params.get("search")?.toLowerCase() ?? "";
      const matching = parts.filter((part) =>
        `${part.name} ${part.catalogNumber}`.toLowerCase().includes(search),
      );
      const partPage: PartPage = {
        items: matching,
        page: 1,
        pageSize: 20,
        totalCount: matching.length,
      };
      return HttpResponse.json(partPage);
    }),
  );
  return requests;
}

function rowOf(name: string) {
  const row = screen.getByRole("cell", { name }).closest("tr");
  if (row === null) {
    throw new Error(`Row ${name} not found`);
  }
  return within(row);
}

describe("PartsPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the stock and the net price and marks parts that run out", async () => {
    mockPartList();
    renderApp("/parts");

    await screen.findByRole("cell", { name: "Filtr powietrza" });

    expect(rowOf("Czynnik chłodniczy R32").getByText("25 szt.")).toBeInTheDocument();
    expect(rowOf("Czynnik chłodniczy R32").queryByText("Niski stan")).not.toBeInTheDocument();
    expect(
      rowOf("Czynnik chłodniczy R32").getByText(formatMoney(89.9, "pl").replace(/\s/g, " ")),
    ).toBeInTheDocument();
    expect(rowOf("Filtr powietrza").getByText("Niski stan")).toBeInTheDocument();
    expect(rowOf("Kondensator rozruchowy").getByText("Brak")).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Nawigacja główna" })).getByRole("link", {
        name: "Części",
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("searches by catalog number and keeps the search in the address", async () => {
    const requests = mockPartList();
    const user = userEvent.setup();
    const router = renderApp("/parts");

    await user.type(await screen.findByLabelText("Szukaj części"), "flt");

    await vi.waitFor(() => {
      expect(requests.at(-1)?.get("search")).toBe("flt");
    }, 5000);
    expect(router.state.location.search).toBe("?search=flt");
    expect(await screen.findByRole("cell", { name: "Filtr powietrza" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Kondensator rozruchowy" })).not.toBeInTheDocument();
  });

  it("explains when the catalog is empty", async () => {
    const emptyPage: PartPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
    server.use(http.get(partsUrl, () => HttpResponse.json(emptyPage)));
    renderApp("/parts");

    expect(await screen.findByRole("heading", { name: "Brak części" })).toBeInTheDocument();
  });

  it("names the search text when no part matches", async () => {
    mockPartList();
    renderApp("/parts?search=pompa");

    expect(await screen.findByText("Żadna część nie pasuje do „pompa”.")).toBeInTheDocument();
  });

  it("shows an error with a retry when the list cannot be loaded", async () => {
    const problem: ProblemDetails = { status: 500, title: "Server error" };
    server.use(http.get(partsUrl, () => HttpResponse.json(problem, { status: 500 })));
    renderApp("/parts");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    mockPartList();
    await userEvent.setup().click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("cell", { name: "Filtr powietrza" })).toBeInTheDocument();
  });
});
