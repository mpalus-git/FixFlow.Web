import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  createPartSchema,
  partFields,
  type PartFormMode,
  type PartFormValues,
} from "@/features/parts/schemas/partSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/TextField";

const duplicateCatalogNumberCode = "Part.DuplicateCatalogNumber";

export type PartFormProps = {
  mode: PartFormMode;
  defaultValues: PartFormValues;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (values: PartFormValues) => Promise<void>;
  onVersionConflict?: () => void;
};

export function PartForm({
  mode,
  defaultValues,
  submitLabel,
  disabled = false,
  onSubmit,
  onVersionConflict,
}: PartFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PartFormValues>({
    resolver: zodResolver(createPartSchema(mode)),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  function showSaveError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "preconditionFailed" && onVersionConflict !== undefined) {
      onVersionConflict();
    } else if (error.errorCode === duplicateCatalogNumberCode) {
      form.setError("catalogNumber", { type: "server", message: describeApiError(error, t) });
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (error.kind !== "validation" || !applyFieldErrors(error, partFields, form.setError)) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: PartFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      showSaveError(error);
    }
  }

  const submit = form.handleSubmit(save);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            id="part-name"
            label={t("parts.columns.name")}
            error={errors.name?.message}
            registration={form.register("name")}
          />
        </div>
        <TextField
          id="part-catalogNumber"
          label={t("parts.columns.catalogNumber")}
          hint={t("parts.form.catalogNumberHint")}
          error={errors.catalogNumber?.message}
          registration={form.register("catalogNumber")}
        />
        <TextField
          id="part-unitPrice"
          inputMode="decimal"
          label={t("parts.form.unitPrice")}
          error={errors.unitPrice?.message}
          registration={form.register("unitPrice")}
        />
        <TextField
          id="part-stockQuantity"
          inputMode="numeric"
          label={t(mode === "create" ? "parts.form.initialStock" : "parts.columns.stockQuantity")}
          {...(mode === "edit" ? { hint: t("parts.form.stockHint") } : {})}
          readOnly={mode === "edit"}
          error={errors.stockQuantity?.message}
          registration={form.register("stockQuantity")}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : submitLabel}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/parts">{t("common.cancel")}</Link>
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
