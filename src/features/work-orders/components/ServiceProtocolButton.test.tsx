import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { ServiceProtocolButton } from "@/features/work-orders/components/ServiceProtocolButton";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { Toaster } from "@/shared/ui/sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

const workOrderId = "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a";
const protocolUrl = `${apiBaseUrl}/api/v1/work-orders/${workOrderId}/protocol`;

function renderButton(status: WorkOrderStatus) {
  renderWithProviders(
    <>
      <ServiceProtocolButton workOrderId={workOrderId} status={status} />
      <Toaster />
    </>,
  );
}

function captureDownloads() {
  const savedBlobs: Blob[] = [];
  const fileNames: string[] = [];
  Object.assign(URL, {
    createObjectURL: (blob: Blob) => {
      savedBlobs.push(blob);
      return "blob:protocol";
    },
    revokeObjectURL: () => undefined,
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click(
    this: HTMLAnchorElement,
  ) {
    fileNames.push(this.download);
  });
  return { savedBlobs, fileNames };
}

describe("ServiceProtocolButton", () => {
  it("downloads the PDF protocol of a completed work order", async () => {
    server.use(
      http.get(
        protocolUrl,
        () =>
          new HttpResponse(new Blob(["%PDF-1.7"], { type: "application/pdf" }), {
            headers: { "Content-Type": "application/pdf" },
          }),
      ),
    );
    const { savedBlobs, fileNames } = captureDownloads();
    renderButton("Completed");

    await userEvent.setup().click(screen.getByRole("button", { name: "Pobierz protokół" }));

    await vi.waitFor(() => {
      expect(fileNames).toEqual([`protokol-${workOrderId}.pdf`]);
    });
    expect(savedBlobs[0]?.type).toBe("application/pdf");
  });

  it("is not offered before the work order is completed", () => {
    renderButton("InProgress");

    expect(screen.queryByRole("button", { name: "Pobierz protokół" })).not.toBeInTheDocument();
  });

  it("offers a retry when the protocol cannot be downloaded", async () => {
    server.use(http.get(protocolUrl, () => HttpResponse.json(null, { status: 503 })));
    renderButton("Invoiced");

    await userEvent.setup().click(screen.getByRole("button", { name: "Pobierz protokół" }));

    expect(await screen.findByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });
});
