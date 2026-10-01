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

type CreatePartRequest = components["schemas"]["CreatePartRequest"];
type PartPage = components["schemas"]["PagedResponseOfPartResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

const partsUrl = `${apiBaseUrl}/api/v1/parts`;

function mockCreate(respond: (request: CreatePartRequest) => Response) {
  const received: CreatePartRequest[] = [];
  server.use(
    http.post<never, CreatePartRequest>(partsUrl, async ({ request }) => {
      const body = await request.json();
      received.push(body);
      return respond(body);
    }),
    http.get(partsUrl, () => {
      const partPage: PartPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
      return HttpResponse.json(partPage);
    }),
  );
  return received;
}

async function fillForm(price: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Nazwa"), "Pompa kondensatu");
  await user.type(screen.getByLabelText("Numer katalogowy"), "pmp-01");
  await user.type(screen.getByLabelText("Cena netto (zł)"), price);
  const stock = screen.getByLabelText("Stan początkowy (szt.)");
  await user.clear(stock);
  await user.type(stock, "4");
  await user.click(screen.getByRole("button", { name: "Dodaj część" }));
}

describe("CreatePartPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("sends the price written with a comma as a number and shows the new part", async () => {
    const received = mockCreate((request) =>
      HttpResponse.json(createPartResponse({ ...request, catalogNumber: "PMP-01" }), {
        status: 201,
        headers: { ETag: '"1"' },
      }),
    );
    const router = renderApp("/parts/new");

    await fillForm("219,99");

    expect(await screen.findByText("Dodano część Pompa kondensatu.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Części", level: 1 })).toBeInTheDocument();
    expect(received).toEqual([
      { name: "Pompa kondensatu", catalogNumber: "pmp-01", unitPrice: 219.99, stockQuantity: 4 },
    ]);
    expect(router.state.location.pathname).toBe("/parts");
    expect(router.state.location.search).toBe("?search=PMP-01");
  });

  it("checks the price before sending the form", async () => {
    const received = mockCreate(() => HttpResponse.json(null, { status: 500 }));
    renderApp("/parts/new");

    await fillForm("12,345");

    expect(await screen.findByText(/Podaj cenę netto w zł/)).toBeInTheDocument();
    expect(screen.getByLabelText("Cena netto (zł)")).toHaveAttribute("aria-invalid", "true");
    expect(received).toEqual([]);
  });

  it("shows a taken catalog number at the field", async () => {
    mockCreate(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        errorCode: "Part.DuplicateCatalogNumber",
      };
      return HttpResponse.json(problem, { status: 409 });
    });
    renderApp("/parts/new");

    await fillForm("219,99");

    expect(
      await screen.findByText(/Część o tym numerze katalogowym już istnieje/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Numer katalogowy")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the validation message of the API at the matching field", async () => {
    mockCreate(() => {
      const problem: ValidationProblem = {
        status: 400,
        title: "Validation failed",
        errors: { unitPrice: ["'Unit Price' must not be more than 12 digits in total."] },
      };
      return HttpResponse.json(problem, { status: 400 });
    });
    renderApp("/parts/new");

    await fillForm("219,99");

    expect(
      await screen.findByText("'Unit Price' must not be more than 12 digits in total."),
    ).toBeInTheDocument();
  });
});
