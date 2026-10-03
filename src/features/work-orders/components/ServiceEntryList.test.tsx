import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { ServiceEntryList } from "@/features/work-orders/components/ServiceEntryList";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { formatMoney } from "@/shared/lib/money";
import { createPartResponse } from "@/test/partFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";
import { createServiceEntryResponse } from "@/test/workOrderFixtures";

type ServiceEntryResponse = components["schemas"]["ServiceEntryResponse"];

const part = createPartResponse();
const workOrderId = "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a";
const entriesUrl = `${apiBaseUrl}/api/v1/work-orders/${workOrderId}/service-entries`;

const workEntry = createServiceEntryResponse({
  photoUrls: ["https://photos.example.com/boiler.jpg"],
  latitude: 50.2649,
  longitude: 19.0238,
  parts: [
    {
      partId: part.id,
      partName: part.name,
      catalogNumber: part.catalogNumber,
      quantity: 3,
      unitPrice: 148.5,
    },
  ],
});
const correction = createServiceEntryResponse({
  id: "7d6c5b4a-3928-4f7e-8d9c-0b1a2f3e4d5c",
  note: "Zwrot nieużytego czujnika",
  isCorrection: true,
  workStartedAt: null,
  workFinishedAt: null,
  createdAt: "2026-07-14T10:00:00Z",
  parts: [
    {
      partId: part.id,
      partName: part.name,
      catalogNumber: part.catalogNumber,
      quantity: 1,
      unitPrice: 148.5,
    },
  ],
});

function money(amount: number): string {
  return formatMoney(amount, "pl").replace(/\s/g, " ");
}

function renderEntries(entries: ServiceEntryResponse[]) {
  server.use(
    http.get(entriesUrl, () => HttpResponse.json(entries)),
    http.get(`${apiBaseUrl}/api/v1/parts/${part.id}`, () =>
      HttpResponse.json(part, { headers: { ETag: '"1"' } }),
    ),
  );
  renderWithProviders(
    <ServiceEntryList workOrderId={workOrderId} technicianLabel={() => "jan@fixflow.test"} />,
  );
}

describe("ServiceEntryList", () => {
  it("shows a work entry with its time in Warsaw, location, photos and used parts", async () => {
    renderEntries([workEntry]);

    const entry = (await screen.findAllByRole("listitem"))[0] ?? document.body;
    expect(within(entry).getByText("14.07.2026 09:00 – 10:30")).toBeInTheDocument();
    expect(within(entry).getByText("jan@fixflow.test")).toBeInTheDocument();
    expect(
      within(entry).getByRole("link", { name: /Pokaż miejsce pracy na mapie/ }),
    ).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=50.2649&mlon=19.0238#map=17/50.2649/19.0238",
    );
    expect(within(entry).getByRole("img", { name: /Zdjęcie 1/ })).toHaveAttribute(
      "src",
      "https://photos.example.com/boiler.jpg",
    );
    const partRow = (await within(entry).findByText("Czujnik ciśnienia wody")).closest("tr");
    expect(within(partRow ?? document.body).getByText(money(445.5))).toBeVisible();
  });

  it("shows a correction as returned parts and subtracts them from the total", async () => {
    renderEntries([workEntry, correction]);

    const entries = await screen.findAllByRole("listitem");
    const correctionEntry = entries.find((item) => within(item).queryByText("Korekta") !== null);
    expect(correctionEntry).toBeDefined();
    expect(within(correctionEntry ?? document.body).getByText("-1")).toBeInTheDocument();
    expect(within(correctionEntry ?? document.body).getAllByText(money(-148.5))).toHaveLength(1);
    expect(screen.getByText("Czas pracy łącznie:").nextElementSibling).toHaveTextContent(
      "1 h 30 min",
    );
    expect(screen.getByText("Części netto łącznie:").nextElementSibling).toHaveTextContent(
      money(297),
    );
  });

  it("explains that entries come from the technician's mobile app", async () => {
    renderEntries([]);

    expect(
      await screen.findByRole("heading", { name: "Brak wpisów serwisowych" }),
    ).toBeInTheDocument();
  });

  it("offers a retry when the entries cannot be loaded", async () => {
    server.use(http.get(entriesUrl, () => HttpResponse.json(null, { status: 500 })));
    renderWithProviders(<ServiceEntryList workOrderId={workOrderId} technicianLabel={() => ""} />);

    expect(await screen.findByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });
});
