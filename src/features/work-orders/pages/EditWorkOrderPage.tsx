import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useUpdateWorkOrderMutation } from "@/features/work-orders/api/workOrderMutations";
import { workOrderQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import { WorkOrderForm } from "@/features/work-orders/components/WorkOrderForm";
import { WorkOrderDeviceName } from "@/features/work-orders/components/WorkOrderDeviceName";
import { WorkOrderStatusBadge } from "@/features/work-orders/components/WorkOrderStatusBadge";
import { useReturnPath } from "@/features/work-orders/hooks/useReturnPath";
import {
  toUpdateWorkOrderRequest,
  toWorkOrderFormValues,
} from "@/features/work-orders/schemas/workOrderSchema";
import { canEditWorkOrder } from "@/features/work-orders/workOrderRules";
import { toLocalDateTimeInput } from "@/shared/lib/dateTime";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { useVersionedResource } from "@/shared/api/useVersionedResource";
import { VersionConflictDialog } from "@/shared/ui/VersionConflictDialog";
import { PageHeader } from "@/shared/ui/PageHeader";

export function EditWorkOrderPage() {
  const { t } = useTranslation();
  const { workOrderId = "" } = useParams();
  const navigate = useNavigate();
  const returnPath = useReturnPath(`/work-orders/${workOrderId}`);
  const {
    query: workOrderQuery,
    editedVersion,
    conflictDialogProps,
    openConflict,
  } = useVersionedResource(workOrderQueryOptions(workOrderId));
  const updateWorkOrderMutation = useUpdateWorkOrderMutation();

  if (editedVersion === undefined) {
    return workOrderQuery.isError ? (
      <ErrorState error={workOrderQuery.error} onRetry={() => void workOrderQuery.refetch()} />
    ) : (
      <ListSkeleton rows={4} />
    );
  }

  const workOrder = editedVersion.data;
  const isEditable = canEditWorkOrder(workOrder.status);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={t("workOrders.edit.title")}
        subject={workOrder.number}
        description={
          <>
            <WorkOrderDeviceName workOrder={workOrder} linked />
            <WorkOrderStatusBadge status={workOrder.status} />
          </>
        }
      />
      {isEditable ? null : (
        <Alert role="note">
          <AlertDescription>{t("apiErrors.workOrderClosed")}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent>
          <WorkOrderForm
            key={editedVersion.etag}
            defaultValues={toWorkOrderFormValues(workOrder)}
            selectsDevice={false}
            unchangedDueDate={toLocalDateTimeInput(workOrder.dueDate)}
            submitLabel={t("workOrders.edit.submit")}
            cancelTo={returnPath}
            disabled={!isEditable}
            onSubmit={async (values) => {
              await updateWorkOrderMutation.mutateAsync({
                workOrderId,
                etag: editedVersion.etag,
                request: toUpdateWorkOrderRequest(values, workOrder),
              });
              toast.success(t("workOrders.edit.saved"));
              await navigate(returnPath);
            }}
            onVersionConflict={openConflict}
          />
        </CardContent>
      </Card>
      <VersionConflictDialog {...conflictDialogProps} />
    </div>
  );
}
