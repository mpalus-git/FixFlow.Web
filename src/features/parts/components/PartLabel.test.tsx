import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { PartLabel } from "@/features/parts/components/PartLabel";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { createPartResponse } from "@/test/partFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

const part = createPartResponse({ archivedAt: "2026-09-20T10:00:00Z" });
const partUrl = `${apiBaseUrl}/api/v1/parts/${part.id}`;

describe("PartLabel", () => {
  it("shows the name and catalog number of a part, also an archived one", async () => {
    server.use(http.get(partUrl, () => HttpResponse.json(part, { headers: { ETag: '"1"' } })));
    renderWithProviders(<PartLabel partId={part.id} />);

    expect(await screen.findByText("Czujnik ciśnienia wody")).toBeInTheDocument();
    expect(screen.getByText("VIE-7828749")).toBeInTheDocument();
  });

  it("marks a part that cannot be loaded", async () => {
    server.use(http.get(partUrl, () => HttpResponse.json(null, { status: 500 })));
    renderWithProviders(<PartLabel partId={part.id} />);

    expect(await screen.findByText("Nieznana część")).toBeInTheDocument();
  });
});
