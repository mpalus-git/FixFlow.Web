import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRestockPartMutation } from "@/features/parts/api/partMutations";
import { type RestockFormValues, restockSchema } from "@/features/parts/schemas/partSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { TextField } from "@/shared/ui/TextField";

type PartResponse = components["schemas"]["PartResponse"];

const concurrentModificationCode = "Persistence.ConcurrentModification";
const restockFields = ["quantity"] as const;

type RestockFormProps = {
  part: PartResponse;
  onDone: () => void;
};

function RestockForm({ part, onDone }: RestockFormProps) {
  const { t } = useTranslation();
  const restockMutation = useRestockPartMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    defaultValues: { quantity: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const quantity = useWatch({ control: form.control, name: "quantity" });
  const parsedQuantity = restockSchema.safeParse({ quantity });

  function showError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setFormError(t("errors.unexpected"));
    } else if (error.errorCode === concurrentModificationCode) {
      setFormError(t("parts.restock.concurrent"));
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, restockFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: RestockFormValues) {
    setFormError(null);
    try {
      const { data: restocked } = await restockMutation.mutateAsync({
        partId: part.id,
        quantity: Number(values.quantity),
      });
      toast.success(
        t("parts.restock.done", {
          name: restocked.name,
          stock: t("parts.stock.units", { count: restocked.stockQuantity }),
        }),
      );
      onDone();
    } catch (error) {
      showError(error);
    }
  }

  const submit = form.handleSubmit(save);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{t("parts.restock.title")}</DialogTitle>
        <DialogDescription>
          {t("parts.restock.description", {
            name: part.name,
            stock: t("parts.stock.units", { count: part.stockQuantity }),
          })}
        </DialogDescription>
      </DialogHeader>
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <TextField
        id="restock-quantity"
        inputMode="numeric"
        label={t("parts.restock.quantity")}
        error={errors.quantity?.message}
        registration={form.register("quantity")}
        {...(parsedQuantity.success
          ? {
              hint: t("parts.restock.preview", {
                stock: t("parts.stock.units", {
                  count: part.stockQuantity + Number(parsedQuantity.data.quantity),
                }),
              }),
            }
          : {})}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("parts.restock.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export type RestockPartDialogProps = {
  part: PartResponse | null;
  onClose: () => void;
};

export function RestockPartDialog({ part, onClose }: RestockPartDialogProps) {
  return (
    <Dialog
      open={part !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        {part === null ? null : <RestockForm key={part.id} part={part} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
