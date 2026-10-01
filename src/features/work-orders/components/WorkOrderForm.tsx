import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import { ClientDeviceFields } from "@/features/work-orders/components/ClientDeviceFields";
import {
  createWorkOrderSchema,
  workOrderFields,
  type WorkOrderFormValues,
  workOrderPriorities,
} from "@/features/work-orders/schemas/workOrderSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import { toLocalDateTimeInput } from "@/shared/lib/dateTime";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FieldError } from "@/shared/ui/FieldError";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { Textarea } from "@/shared/ui/textarea";
import { TextField } from "@/shared/ui/TextField";

const deviceErrorCodes: readonly string[] = ["WorkOrder.DeviceArchived", "Device.NotFound"];

export type WorkOrderFormProps = {
  defaultValues: WorkOrderFormValues;
  selectsDevice: boolean;
  unchangedDueDate: string | null;
  submitLabel: string;
  cancelTo: string;
  disabled?: boolean;
  onSubmit: (values: WorkOrderFormValues) => Promise<void>;
  onVersionConflict?: () => void;
};

export function WorkOrderForm({
  defaultValues,
  selectsDevice,
  unchangedDueDate,
  submitLabel,
  cancelTo,
  disabled = false,
  onSubmit,
  onVersionConflict,
}: WorkOrderFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [schema] = useState(() =>
    createWorkOrderSchema({ requiresDevice: selectsDevice, unchangedDueDate }),
  );
  const form = useForm<WorkOrderFormValues>({ resolver: zodResolver(schema), defaultValues });
  const { errors, isSubmitting } = form.formState;

  function showSaveError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "preconditionFailed" && onVersionConflict !== undefined) {
      onVersionConflict();
    } else if (
      selectsDevice &&
      error.errorCode !== null &&
      deviceErrorCodes.includes(error.errorCode)
    ) {
      form.setError("deviceId", { type: "server", message: describeApiError(error, t) });
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, workOrderFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: WorkOrderFormValues) {
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
        {selectsDevice ? <ClientDeviceFields control={form.control} /> : null}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="work-order-description">{t("workOrders.columns.description")}</Label>
          <Textarea
            id="work-order-description"
            rows={4}
            aria-invalid={errors.description !== undefined}
            aria-describedby="work-order-description-error"
            {...form.register("description")}
          />
          <FieldError id="work-order-description-error" message={errors.description?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="work-order-priority">{t("workOrders.columns.priority")}</Label>
          <NativeSelect id="work-order-priority" className="w-full" {...form.register("priority")}>
            {workOrderPriorities.map((priority) => (
              <NativeSelectOption key={priority} value={priority}>
                {t(`workOrders.priority.${priority}`)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <TextField
          id="work-order-dueDate"
          type="datetime-local"
          min={toLocalDateTimeInput(new Date().toISOString())}
          label={t("workOrders.columns.dueDate")}
          hint={t("workOrders.form.dueDateHint")}
          error={errors.dueDate?.message}
          registration={form.register("dueDate")}
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
