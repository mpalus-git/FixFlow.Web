import { useQuery } from "@tanstack/react-query";
import {
  CheckCheckIcon,
  ReceiptTextIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  useCompleteWorkOrderMutation,
  useInvoiceWorkOrderMutation,
  useUnassignTechnicianMutation,
} from "@/features/work-orders/api/workOrderActionMutations";
import { serviceEntriesQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import { AssignTechnicianDialog } from "@/features/work-orders/components/AssignTechnicianDialog";
import { ConfirmActionDialog } from "@/features/work-orders/components/ConfirmActionDialog";
import { availableWorkOrderActions } from "@/features/work-orders/workOrderRules";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import type { Role } from "@/shared/session/currentUser";
import { Button } from "@/shared/ui/button";

type WorkOrderResponse = components["schemas"]["WorkOrderResponse"];

type OpenDialog = "assign" | "complete" | "invoice" | null;

export type WorkOrderActionsProps = {
  workOrder: WorkOrderResponse;
  role: Role;
};

export function WorkOrderActions({ workOrder, role }: WorkOrderActionsProps) {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const actions = availableWorkOrderActions(workOrder.status, role);
  const entriesQuery = useQuery({
    ...serviceEntriesQueryOptions(workOrder.id),
    enabled: actions.complete,
  });
  const unassignMutation = useUnassignTechnicianMutation();
  const completeMutation = useCompleteWorkOrderMutation();
  const invoiceMutation = useInvoiceWorkOrderMutation();
  const canComplete = entriesQuery.data !== undefined && entriesQuery.data.length > 0;

  function showError(error: unknown) {
    toast.error(describeApiError(error, t));
  }

  function closeDialog(open: boolean) {
    if (!open) {
      setOpenDialog(null);
    }
  }

  return (
    <>
      {actions.assign ? (
        <Button
          onClick={() => {
            setOpenDialog("assign");
          }}
        >
          <UserPlusIcon aria-hidden="true" />
          {t("workOrders.actions.assign")}
        </Button>
      ) : null}
      {actions.changeTechnician ? (
        <Button
          variant="outline"
          onClick={() => {
            setOpenDialog("assign");
          }}
        >
          <UsersIcon aria-hidden="true" />
          {t("workOrders.actions.changeTechnician")}
        </Button>
      ) : null}
      {actions.unassign ? (
        <Button
          variant="outline"
          disabled={unassignMutation.isPending}
          onClick={() => {
            unassignMutation.mutate(workOrder.id, {
              onSuccess: () => toast.success(t("workOrders.actions.unassigned")),
              onError: showError,
            });
          }}
        >
          <UserMinusIcon aria-hidden="true" />
          {t("workOrders.actions.unassign")}
        </Button>
      ) : null}
      {actions.complete ? (
        <div className="flex flex-col items-start gap-1">
          <Button
            variant="outline"
            disabled={!canComplete || completeMutation.isPending}
            aria-describedby={canComplete ? undefined : "complete-work-order-hint"}
            onClick={() => {
              setOpenDialog("complete");
            }}
          >
            <CheckCheckIcon aria-hidden="true" />
            {t("workOrders.actions.complete")}
          </Button>
          {canComplete || entriesQuery.data === undefined ? null : (
            <p id="complete-work-order-hint" className="text-xs text-muted-foreground">
              {t("workOrders.actions.completeRequiresEntries")}
            </p>
          )}
        </div>
      ) : null}
      {actions.invoice ? (
        <Button
          disabled={invoiceMutation.isPending}
          onClick={() => {
            setOpenDialog("invoice");
          }}
        >
          <ReceiptTextIcon aria-hidden="true" />
          {t("workOrders.actions.invoice")}
        </Button>
      ) : null}
      <AssignTechnicianDialog
        workOrderId={workOrder.id}
        currentTechnicianId={workOrder.technicianId}
        open={openDialog === "assign"}
        onOpenChange={closeDialog}
      />
      <ConfirmActionDialog
        open={openDialog === "complete"}
        title={t("workOrders.actions.completeTitle")}
        description={t("workOrders.actions.completeDescription")}
        confirmLabel={t("workOrders.actions.complete")}
        onOpenChange={closeDialog}
        onConfirm={() => {
          completeMutation.mutate(workOrder.id, {
            onSuccess: () => toast.success(t("workOrders.actions.completed")),
            onError: showError,
          });
        }}
      />
      <ConfirmActionDialog
        open={openDialog === "invoice"}
        title={t("workOrders.actions.invoiceTitle")}
        description={t("workOrders.actions.invoiceDescription")}
        confirmLabel={t("workOrders.actions.invoice")}
        onOpenChange={closeDialog}
        onConfirm={() => {
          invoiceMutation.mutate(workOrder.id, {
            onSuccess: () => toast.success(t("workOrders.actions.invoiced")),
            onError: showError,
          });
        }}
      />
    </>
  );
}
