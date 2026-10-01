import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useCreateWorkOrderMutation } from "@/features/work-orders/api/workOrderMutations";
import { WorkOrderForm } from "@/features/work-orders/components/WorkOrderForm";
import { useReturnPath } from "@/features/work-orders/hooks/useReturnPath";
import {
  emptyWorkOrderFormValues,
  toCreateWorkOrderRequest,
} from "@/features/work-orders/schemas/workOrderSchema";
import { Card, CardContent } from "@/shared/ui/card";

export function CreateWorkOrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = useReturnPath();
  const createWorkOrderMutation = useCreateWorkOrderMutation();
  const [defaultValues] = useState(() =>
    emptyWorkOrderFormValues(
      searchParams.get("clientId") ?? "",
      searchParams.get("deviceId") ?? "",
    ),
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("workOrders.create.title")}</h1>
      <Card>
        <CardContent>
          <WorkOrderForm
            defaultValues={defaultValues}
            selectsDevice
            unchangedDueDate={null}
            submitLabel={t("workOrders.create.submit")}
            cancelTo={returnPath}
            onSubmit={async (values) => {
              const { data: workOrder } = await createWorkOrderMutation.mutateAsync(
                toCreateWorkOrderRequest(values),
              );
              toast.success(t("workOrders.create.created"));
              await navigate(`/work-orders/${workOrder.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
