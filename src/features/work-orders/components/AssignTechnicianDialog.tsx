import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { activeTechnicianOptionsQueryOptions } from "@/shared/api/technicianQueries";
import {
  useAssignTechnicianMutation,
  useChangeTechnicianMutation,
} from "@/features/work-orders/api/workOrderActionMutations";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FieldError } from "@/shared/ui/FieldError";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";

const technicianNotFoundCode = "WorkOrder.TechnicianNotFound";

export type AssignTechnicianDialogProps = {
  workOrderId: string;
  currentTechnicianId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignTechnicianDialog({
  workOrderId,
  currentTechnicianId,
  open,
  onOpenChange,
}: AssignTechnicianDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isChange = currentTechnicianId !== null;
  const techniciansQuery = useQuery({ ...activeTechnicianOptionsQueryOptions(), enabled: open });
  const assignMutation = useAssignTechnicianMutation();
  const changeMutation = useChangeTechnicianMutation();
  const [technicianId, setTechnicianId] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const isSaving = assignMutation.isPending || changeMutation.isPending;
  const technicians = techniciansQuery.data?.filter(
    (technician) => technician.id !== currentTechnicianId,
  );

  function close() {
    setTechnicianId("");
    setFieldError(undefined);
    onOpenChange(false);
  }

  function showError(error: unknown) {
    if (error instanceof ApiError && error.errorCode === technicianNotFoundCode) {
      setFieldError(describeApiError(error, t));
      void queryClient.invalidateQueries({
        queryKey: activeTechnicianOptionsQueryOptions().queryKey,
      });
    } else {
      toast.error(error instanceof ApiError ? describeApiError(error, t) : t("errors.unexpected"));
      close();
    }
  }

  async function submit() {
    if (technicianId === "") {
      setFieldError("validation.required");
      return;
    }
    try {
      const mutation = isChange ? changeMutation : assignMutation;
      await mutation.mutateAsync({ workOrderId, technicianId });
      toast.success(t(isChange ? "workOrders.assign.changed" : "workOrders.assign.assigned"));
      close();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close();
        }
      }}
    >
      <DialogContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>
              {t(isChange ? "workOrders.assign.changeTitle" : "workOrders.assign.title")}
            </DialogTitle>
            <DialogDescription>
              {t(
                isChange ? "workOrders.assign.changeDescription" : "workOrders.assign.description",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-technician">{t("workOrders.columns.technician")}</Label>
            <NativeSelect
              id="assign-technician"
              className="w-full"
              value={technicianId}
              aria-invalid={fieldError !== undefined}
              aria-describedby="assign-technician-error"
              onChange={(event) => {
                setTechnicianId(event.target.value);
                setFieldError(undefined);
              }}
            >
              <NativeSelectOption value="">
                {techniciansQuery.isError
                  ? t("workOrders.form.optionsError")
                  : technicians === undefined
                    ? t("workOrders.form.loadingOptions")
                    : technicians.length === 0
                      ? t("workOrders.assign.noTechnicians")
                      : t("workOrders.assign.chooseTechnician")}
              </NativeSelectOption>
              {technicians?.map((technician) => (
                <NativeSelectOption key={technician.id} value={technician.id}>
                  {technician.fullName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError id="assign-technician-error" message={fieldError} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t("common.saving")
                : t(isChange ? "workOrders.assign.changeSubmit" : "workOrders.assign.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
