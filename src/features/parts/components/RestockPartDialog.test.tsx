import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { RestockPartDialog } from "@/features/parts/components/RestockPartDialog";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { Toaster } from "@/shared/ui/sonner";
import { createPartResponse } from "@/test/partFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type RestockPartRequest = components["schemas"]["RestockPartRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const part = createPartResponse({ name: "Filtr powietrza", stockQuantity: 3 });

function mockRestock(respond: (quantity: number) => Response) {
  const quantities: number[] = [];
  server.use(
    http.post<never, RestockPartRequest>(
      `${apiBaseUrl}/api/v1/parts/${part.id}/restock`,
      async ({ request }) => {
        const { quantity } = await request.json();
        quantities.push(quantity);
        return respond(quantity);
      },
    ),
  );
  return quantities;
}

function renderDialog() {
  const onClose = vi.fn<() => void>();
  renderWithProviders(
    <>
      <RestockPartDialog part={part} onClose={onClose} />
      <Toaster />
    </>,
  );
  return onClose;
}

describe("RestockPartDialog", () => {
  it("previews the stock after the delivery and reports the stock saved by the server", async () => {
    const quantities = mockRestock((quantity) =>
      HttpResponse.json(
        { ...part, stockQuantity: part.stockQuantity + quantity + 1 },
        { headers: { ETag: '"2"' } },
      ),
    );
    const user = userEvent.setup();
    const onClose = renderDialog();

    expect(screen.getByText("Filtr powietrza – obecnie 3 szt.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Liczba dostarczonych sztuk"), "20");
    expect(screen.getByText("Stan po przyjęciu: 23 szt.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Przyjmij dostawę" }));

    expect(
      await screen.findByText("Przyjęto dostawę części Filtr powietrza. Stan: 24 szt."),
    ).toBeInTheDocument();
    expect(quantities).toEqual([20]);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not send a delivery of zero units", async () => {
    const quantities = mockRestock(() => HttpResponse.json(null, { status: 500 }));
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Liczba dostarczonych sztuk"), "0");
    await user.click(screen.getByRole("button", { name: "Przyjmij dostawę" }));

    expect(await screen.findByText("Podaj liczbę całkowitą od 1 do 100 000")).toBeInTheDocument();
    expect(quantities).toEqual([]);
  });

  it("keeps the dialog open with a retry hint when the stock changed at the same moment", async () => {
    mockRestock(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        errorCode: "Persistence.ConcurrentModification",
      };
      return HttpResponse.json(problem, { status: 409 });
    });
    const user = userEvent.setup();
    const onClose = renderDialog();

    await user.type(screen.getByLabelText("Liczba dostarczonych sztuk"), "5");
    await user.click(screen.getByRole("button", { name: "Przyjmij dostawę" }));

    expect(
      await screen.findByText("Stan części zmienił się w tym samym momencie. Spróbuj ponownie."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
