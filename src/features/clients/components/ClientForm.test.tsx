import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ClientForm } from "@/features/clients/components/ClientForm";
import {
  type ClientFormValues,
  emptyClientFormValues,
  toClientFormValues,
} from "@/features/clients/schemas/clientSchema";
import { ApiError } from "@/shared/api/apiError";
import { createClientResponse } from "@/test/clientFixtures";

const savedValues = toClientFormValues(createClientResponse());

function renderClientForm({
  defaultValues = savedValues,
  onSubmit = vi.fn<(values: ClientFormValues) => Promise<void>>().mockResolvedValue(),
  onVersionConflict = vi.fn(),
}: {
  defaultValues?: ClientFormValues;
  onSubmit?: (values: ClientFormValues) => Promise<void>;
  onVersionConflict?: () => void;
} = {}) {
  render(
    <MemoryRouter>
      <ClientForm
        defaultValues={defaultValues}
        submitLabel="Zapisz"
        cancelTo="/clients"
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

describe("ClientForm", () => {
  it("shows validation errors without saving an empty client", async () => {
    const { onSubmit } = renderClientForm({ defaultValues: emptyClientFormValues });

    await submit();

    expect(await screen.findAllByText("To pole jest wymagane")).toHaveLength(7);
    expect(screen.getByLabelText("Kod pocztowy")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("E-mail (opcjonalnie)")).toHaveAttribute("aria-invalid", "false");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("saves the entered values", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderClientForm();

    await user.clear(screen.getByLabelText("Nazwa"));
    await user.type(screen.getByLabelText("Nazwa"), "Piekarnia Kowalski i Syn");
    await submit();

    expect(onSubmit).toHaveBeenCalledWith({ ...savedValues, name: "Piekarnia Kowalski i Syn" });
  });

  it("shows server validation errors at the matching fields, also inside the address", async () => {
    renderClientForm({
      onSubmit: () =>
        Promise.reject(
          new ApiError({
            kind: "validation",
            fieldErrors: {
              "address.postalCode": ["Postal code must have the NN-NNN format."],
              phone: ["Phone must have 9 to 20 digits, spaces or dashes and may start with +."],
            },
          }),
        ),
    });

    await submit();

    expect(await screen.findByText("Postal code must have the NN-NNN format.")).toBeVisible();
    expect(screen.getByLabelText("Kod pocztowy")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Telefon")).toHaveAttribute("aria-invalid", "true");
  });

  it("reports a version conflict instead of showing an error", async () => {
    const { onVersionConflict } = renderClientForm({
      onSubmit: () => Promise.reject(new ApiError({ kind: "preconditionFailed", status: 412 })),
    });

    await submit();

    await vi.waitFor(() => {
      expect(onVersionConflict).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("explains that an archived client cannot be changed", async () => {
    renderClientForm({
      onSubmit: () =>
        Promise.reject(
          new ApiError({
            kind: "conflict",
            status: 409,
            errorCode: "Client.Archived",
            detail: "Archived client cannot be modified.",
          }),
        ),
    });

    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Klient jest zarchiwizowany i nie można go zmieniać.",
    );
  });
});
