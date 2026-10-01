import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { WorkOrderForm } from "@/features/work-orders/components/WorkOrderForm";
import {
  emptyWorkOrderFormValues,
  type WorkOrderFormValues,
} from "@/features/work-orders/schemas/workOrderSchema";
import { ApiError } from "@/shared/api/apiError";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceListItem } from "@/test/deviceFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];

const client = createClientResponse();
const device = createDeviceListItem();

function mockSelectionOptions() {
  const clientPage: ClientPage = { items: [client], page: 1, pageSize: 100, totalCount: 1 };
  const devicePage: DevicePage = { items: [device], page: 1, pageSize: 100, totalCount: 1 };
  server.use(
    http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(clientPage)),
    http.get(`${apiBaseUrl}/api/v1/devices`, ({ request }) =>
      new URL(request.url).searchParams.get("clientId") === client.id
        ? HttpResponse.json(devicePage)
        : HttpResponse.json(null, { status: 400 }),
    ),
  );
}

type RenderOptions = {
  selectsDevice: boolean;
  defaultValues?: WorkOrderFormValues;
  onSubmit?: (values: WorkOrderFormValues) => Promise<void>;
  onVersionConflict?: () => void;
};

function renderForm({
  selectsDevice,
  defaultValues = emptyWorkOrderFormValues(),
  onSubmit = vi.fn<(values: WorkOrderFormValues) => Promise<void>>(),
  onVersionConflict = vi.fn(),
}: RenderOptions) {
  renderWithProviders(
    <MemoryRouter>
      <WorkOrderForm
        defaultValues={defaultValues}
        selectsDevice={selectsDevice}
        unchangedDueDate={null}
        submitLabel="Zapisz"
        cancelTo="/work-orders"
        onSubmit={onSubmit}
        onVersionConflict={onVersionConflict}
      />
    </MemoryRouter>,
  );
}

async function fillValidWorkOrder() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: client.name });
  await user.selectOptions(screen.getByLabelText("Klient"), client.name);
  await screen.findByRole("option", { name: "SN-2024-0001 · Viessmann Vitodens 200-W" });
  await user.selectOptions(screen.getByLabelText("Urządzenie"), device.id);
  await user.type(screen.getByLabelText("Opis usterki"), "Kocioł nie grzeje wody");
  await user.selectOptions(screen.getByLabelText("Priorytet"), "Krytyczny");
  fireEvent.change(screen.getByLabelText("Termin"), { target: { value: "2030-01-15T10:00" } });
  return user;
}

describe("WorkOrderForm", () => {
  it("asks for the client, device, description and due date", async () => {
    mockSelectionOptions();
    renderForm({ selectsDevice: true });

    await screen.findByRole("option", { name: client.name });
    await userEvent.setup().click(screen.getByRole("button", { name: "Zapisz" }));

    expect(await screen.findAllByText("To pole jest wymagane")).toHaveLength(4);
  });

  it("offers the devices of the chosen client and submits the work order", async () => {
    mockSelectionOptions();
    const onSubmit = vi.fn<(values: WorkOrderFormValues) => Promise<void>>();
    renderForm({ selectsDevice: true, onSubmit });

    const user = await fillValidWorkOrder();
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onSubmit).toHaveBeenCalledWith({
      clientId: client.id,
      deviceId: device.id,
      description: "Kocioł nie grzeje wody",
      priority: "Critical",
      dueDate: "2030-01-15T10:00",
    });
  });

  it("shows on the device field that the device was archived in the meantime", async () => {
    mockSelectionOptions();
    const onSubmit = vi.fn<(values: WorkOrderFormValues) => Promise<void>>(() =>
      Promise.reject(
        new ApiError({ kind: "conflict", status: 409, errorCode: "WorkOrder.DeviceArchived" }),
      ),
    );
    renderForm({ selectsDevice: true, onSubmit });

    const user = await fillValidWorkOrder();
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(await screen.findByText(/zarchiwizowane urządzenie/)).toBeInTheDocument();
    expect(screen.getByLabelText("Urządzenie")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the API due date error on the due date field", async () => {
    const onSubmit = vi.fn<(values: WorkOrderFormValues) => Promise<void>>(() =>
      Promise.reject(
        new ApiError({
          kind: "validation",
          status: 400,
          fieldErrors: { dueDate: ["Due date must be in the future."] },
        }),
      ),
    );
    renderForm({
      selectsDevice: false,
      defaultValues: {
        ...emptyWorkOrderFormValues("", device.id),
        description: "Przegląd",
        dueDate: "2030-01-15T10:00",
      },
      onSubmit,
    });

    await userEvent.setup().click(screen.getByRole("button", { name: "Zapisz" }));

    expect(await screen.findByText("Due date must be in the future.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Klient")).not.toBeInTheDocument();
  });

  it("reports a version conflict instead of overwriting the work order", async () => {
    const onVersionConflict = vi.fn();
    const onSubmit = vi.fn<(values: WorkOrderFormValues) => Promise<void>>(() =>
      Promise.reject(new ApiError({ kind: "preconditionFailed", status: 412 })),
    );
    renderForm({
      selectsDevice: false,
      defaultValues: {
        ...emptyWorkOrderFormValues("", device.id),
        description: "Przegląd",
        dueDate: "2030-01-15T10:00",
      },
      onSubmit,
      onVersionConflict,
    });

    await userEvent.setup().click(screen.getByRole("button", { name: "Zapisz" }));

    await vi.waitFor(() => {
      expect(onVersionConflict).toHaveBeenCalledTimes(1);
    });
  });
});
