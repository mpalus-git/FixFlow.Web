import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createPartResponse } from "@/test/partFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";

type PartResponse = components["schemas"]["PartResponse"];
type PartPage = components["schemas"]["PagedResponseOfPartResponse"];
type UpdatePartRequest = components["schemas"]["UpdatePartRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const part = createPartResponse();
const partUrl = `${apiBaseUrl}/api/v1/parts/${part.id}`;
const editPath = `/parts/${part.id}/edit`;

function mockStoredPart(initial: PartResponse = part) {
  const stored = { part: initial, etag: '"1"' };
  server.use(
    http.get(partUrl, () => HttpResponse.json(stored.part, { headers: { ETag: stored.etag } })),
    http.get(`${apiBaseUrl}/api/v1/parts`, () => {
      const partPage: PartPage = { items: [stored.part], page: 1, pageSize: 20, totalCount: 1 };
      return HttpResponse.json(partPage);
    }),
  );
  return stored;
}

describe("EditPartPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("saves the changes with the edited version and returns to the catalog", async () => {
    const stored = mockStoredPart();
    const received: { ifMatch: string | null; body: UpdatePartRequest }[] = [];
    server.use(
      http.put<never, UpdatePartRequest>(partUrl, async ({ request }) => {
        const body = await request.json();
        received.push({ ifMatch: request.headers.get("If-Match"), body });
        stored.part = { ...part, ...body };
        stored.etag = '"2"';
        return HttpResponse.json(stored.part, { headers: { ETag: stored.etag } });
      }),
    );
    const user = userEvent.setup();
    const router = renderApp(editPath);

    const priceInput = await screen.findByLabelText("Cena netto (zł)");
    expect(priceInput).toHaveValue("148,50");
    expect(screen.getByLabelText("Stan")).toHaveAttribute("readonly");
    await user.clear(priceInput);
    await user.type(priceInput, "155");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(await screen.findByText("Zapisano zmiany części.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Części", level: 1 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/parts");
    expect(received).toEqual([
      {
        ifMatch: '"1"',
        body: { name: part.name, catalogNumber: part.catalogNumber, unitPrice: 155 },
      },
    ]);
  });

  it("offers to load the current version after a conflict", async () => {
    const stored = mockStoredPart();
    server.use(
      http.put(partUrl, () => {
        stored.part = { ...part, name: "Czujnik ciśnienia wody Viessmann" };
        stored.etag = '"2"';
        const problem: ProblemDetails = { status: 412, title: "Precondition Failed" };
        return HttpResponse.json(problem, { status: 412 });
      }),
    );
    const user = userEvent.setup();
    renderApp(editPath);

    await user.type(await screen.findByLabelText("Nazwa"), " 24 V");
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));
    await user.click(await screen.findByRole("button", { name: "Wczytaj aktualną wersję" }));

    expect(await screen.findByDisplayValue("Czujnik ciśnienia wody Viessmann")).toBeInTheDocument();
    expect(screen.getByLabelText("Cena netto (zł)")).toHaveValue("148,50");
  });

  it("does not allow editing an archived part", async () => {
    mockStoredPart({ ...part, archivedAt: "2026-09-20T10:00:00Z" });
    renderApp(editPath);

    expect(await screen.findByRole("note")).toHaveTextContent("Część jest zarchiwizowana");
    expect(screen.getByLabelText("Nazwa")).toBeDisabled();
  });
});
