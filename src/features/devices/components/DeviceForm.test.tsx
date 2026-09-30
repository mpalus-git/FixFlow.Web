import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DeviceForm } from "@/features/devices/components/DeviceForm";
import {
  type DeviceFormValues,
  emptyDeviceFormValues,
  toDeviceFormValues,
} from "@/features/devices/schemas/deviceSchema";
import { ApiError } from "@/shared/api/apiError";
import { createDeviceResponse } from "@/test/deviceFixtures";

const savedValues = toDeviceFormValues(createDeviceResponse());

function renderDeviceForm({
  defaultValues = savedValues,
  onSubmit = vi.fn<(values: DeviceFormValues) => Promise<void>>().mockResolvedValue(),
  onVersionConflict = vi.fn(),
}: {
  defaultValues?: DeviceFormValues;
  onSubmit?: (values: DeviceFormValues) => Promise<void>;
  onVersionConflict?: () => void;
} = {}) {
  render(
    <MemoryRouter>
      <DeviceForm
        defaultValues={defaultValues}
        submitLabel="Zapisz"
        cancelTo="/devices"
        onSubmit={onSubmit}
        onVersionConflict={onVersionConflict}
      />
    </MemoryRouter>,
  );
  return { onSubmit, onVersionConflict };
}

async function submit() {
  await userEvent.setup().click(screen.getByRole("button", { name: "Zapisz" }));
}

describe("DeviceForm", () => {
  it("shows validation errors without saving an empty device", async () => {
    const { onSubmit } = renderDeviceForm({ defaultValues: emptyDeviceFormValues });

    await submit();

    expect(await screen.findAllByText("To pole jest wymagane")).toHaveLength(4);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not offer dates after today in Warsaw", () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T22:30:00Z"), toFake: ["Date"] });
    renderDeviceForm();

    expect(screen.getByLabelText("Data instalacji")).toHaveAttribute("max", "2026-07-16");
    vi.useRealTimers();
  });

  it("saves the entered values", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDeviceForm();

    await user.clear(screen.getByLabelText("Model"));
    await user.type(screen.getByLabelText("Model"), "Vitodens 300-W");
    await submit();

    expect(onSubmit).toHaveBeenCalledWith({ ...savedValues, model: "Vitodens 300-W" });
  });

  it("shows a taken serial number at the serial number field", async () => {
    renderDeviceForm({
      onSubmit: () =>
        Promise.reject(
          new ApiError({
            kind: "conflict",
            status: 409,
            errorCode: "Device.DuplicateSerialNumber",
            detail: "A device with this serial number already exists.",
          }),
        ),
    });

    await submit();

    expect(
      await screen.findByText(/Urządzenie o tym numerze seryjnym już istnieje/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Numer seryjny/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("reports a version conflict instead of showing an error", async () => {
    const { onVersionConflict } = renderDeviceForm({
      onSubmit: () => Promise.reject(new ApiError({ kind: "preconditionFailed", status: 412 })),
    });

    await submit();

    await vi.waitFor(() => {
      expect(onVersionConflict).toHaveBeenCalledOnce();
    });
  });

  it("explains that devices cannot be added to an archived client", async () => {
    renderDeviceForm({
      onSubmit: () =>
        Promise.reject(
          new ApiError({ kind: "conflict", status: 409, errorCode: "Device.ClientArchived" }),
        ),
    });

    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nie można dodać urządzenia do zarchiwizowanego klienta.",
    );
  });
});
