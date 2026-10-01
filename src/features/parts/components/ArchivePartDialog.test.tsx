import { screen, within } from "@testing-library/react";
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
type ProblemDetails = components["schemas"]["ProblemDetails"];

const part = createPartResponse({ name: "Filtr powietrza" });

function mockCatalog(archive: (stored: { parts: PartResponse[] }) => Response) {
  const stored = { parts: [part] };
  server.use(
    http.get(`${apiBaseUrl}/api/v1/parts`, () => {
      const partPage: PartPage = {
        items: stored.parts,
        page: 1,
        pageSize: 20,
        totalCount: stored.parts.length,
      };
      return HttpResponse.json(partPage);
    }),
    http.post(`${apiBaseUrl}/api/v1/parts/${part.id}/archive`, () => archive(stored)),
  );
}

async function archiveFromList() {
  const user = userEvent.setup();
  renderApp("/parts");
  await user.click(await screen.findByRole("button", { name: "Akcje części Filtr powietrza" }));
  await user.click(screen.getByRole("menuitem", { name: "Archiwizuj" }));
  await user.click(
    within(screen.getByRole("alertdialog")).getByRole("button", { name: "Archiwizuj" }),
  );
}

describe("ArchivePartDialog", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("removes the archived part from the catalog after confirmation", async () => {
    mockCatalog((stored) => {
      stored.parts = [];
      return new HttpResponse(null, { status: 204 });
    });

    await archiveFromList();

    expect(await screen.findByText("Zarchiwizowano część Filtr powietrza.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Brak części" })).toBeInTheDocument();
  });

  it("brings the part back and explains when archiving collides with another change", async () => {
    mockCatalog(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        errorCode: "Persistence.ConcurrentModification",
      };
      return HttpResponse.json(problem, { status: 409 });
    });

    await archiveFromList();

    expect(
      await screen.findByText("Część została zmieniona w tym samym momencie. Spróbuj ponownie."),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Filtr powietrza" })).toBeInTheDocument();
  });
});
