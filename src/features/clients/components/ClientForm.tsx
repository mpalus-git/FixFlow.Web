import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  clientFields,
  type ClientFormValues,
  clientSchema,
} from "@/features/clients/schemas/clientSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { TextField, type TextFieldProps } from "@/shared/ui/TextField";

export type ClientFormProps = {
  defaultValues: ClientFormValues;
  submitLabel: string;
  cancelTo: string;
  disabled?: boolean;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onVersionConflict?: () => void;
};

export function ClientForm({
  defaultValues,
  submitLabel,
  cancelTo,
  disabled = false,
  onSubmit,
  onVersionConflict,
}: ClientFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });
  const { isSubmitting } = form.formState;

  function showSaveError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "preconditionFailed" && onVersionConflict !== undefined) {
      onVersionConflict();
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, clientFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: ClientFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      showSaveError(error);
    }
  }

  const submit = form.handleSubmit(save);

  function textField(
    name: (typeof clientFields)[number],
    label: string,
    options: Pick<TextFieldProps, "type" | "autoComplete" | "inputMode"> = {},
  ) {
    return (
      <TextField
        id={`client-${name.replace(".", "-")}`}
        label={label}
        error={form.getFieldState(name, form.formState).error?.message}
        registration={form.register(name)}
        {...options}
      />
    );
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <fieldset disabled={disabled} className="flex flex-col gap-6">
        {textField("name", t("clients.fields.name"), { autoComplete: "organization" })}
        <fieldset className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <legend className="mb-3 text-base font-medium">{t("clients.fields.address")}</legend>
          {textField("address.street", t("clients.fields.street"))}
          {textField("address.buildingNumber", t("clients.fields.buildingNumber"))}
          {textField("address.postalCode", t("clients.fields.postalCode"), {
            inputMode: "numeric",
          })}
          {textField("address.city", t("clients.fields.city"))}
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-base font-medium">{t("clients.fields.contact")}</legend>
          <div className="sm:col-span-2">
            {textField("contactPerson", t("clients.fields.contactPerson"))}
          </div>
          {textField("phone", t("clients.fields.phone"), { type: "tel", inputMode: "tel" })}
          {textField("email", t("clients.fields.email"), { type: "email" })}
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : submitLabel}
          </Button>
          <Button variant="outline" asChild>
            <Link to={cancelTo}>{t("common.cancel")}</Link>
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
