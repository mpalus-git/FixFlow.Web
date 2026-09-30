import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  deviceFields,
  type DeviceFormValues,
  deviceSchema,
} from "@/features/devices/schemas/deviceSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import { todayCalendarDate } from "@/shared/lib/dateTime";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/TextField";

const duplicateSerialNumberCode = "Device.DuplicateSerialNumber";

export type DeviceFormProps = {
  defaultValues: DeviceFormValues;
  submitLabel: string;
  cancelTo: string;
  disabled?: boolean;
  onSubmit: (values: DeviceFormValues) => Promise<void>;
  onVersionConflict?: () => void;
};

export function DeviceForm({
  defaultValues,
  submitLabel,
  cancelTo,
  disabled = false,
  onSubmit,
  onVersionConflict,
}: DeviceFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  function showSaveError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "preconditionFailed" && onVersionConflict !== undefined) {
      onVersionConflict();
    } else if (error.errorCode === duplicateSerialNumberCode) {
      form.setError("serialNumber", { type: "server", message: describeApiError(error, t) });
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, deviceFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: DeviceFormValues) {
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
            id="device-serialNumber"
            label={t("devices.columns.serialNumber")}
            hint={t("devices.form.serialNumberHint")}
            error={errors.serialNumber?.message}
            registration={form.register("serialNumber")}
          />
        </div>
        <TextField
          id="device-manufacturer"
          label={t("devices.fields.manufacturer")}
          error={errors.manufacturer?.message}
          registration={form.register("manufacturer")}
        />
        <TextField
          id="device-model"
          label={t("devices.fields.model")}
          error={errors.model?.message}
          registration={form.register("model")}
        />
        <TextField
          id="device-installationDate"
          type="date"
          max={todayCalendarDate()}
          label={t("devices.columns.installationDate")}
          error={errors.installationDate?.message}
          registration={form.register("installationDate")}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
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
