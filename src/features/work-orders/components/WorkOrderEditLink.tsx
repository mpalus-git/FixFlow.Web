import { PencilIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import type { ReturnPathState } from "@/features/work-orders/hooks/useReturnPath";
import type { WorkOrderListItem } from "@/features/work-orders/hooks/useWorkOrderColumns";
import { canEditWorkOrder } from "@/features/work-orders/workOrderRules";
import { Button } from "@/shared/ui/button";

export type WorkOrderEditLinkProps = {
  workOrder: WorkOrderListItem;
};

export function WorkOrderEditLink({ workOrder }: WorkOrderEditLinkProps) {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  if (!canEditWorkOrder(workOrder.status)) {
    return null;
  }

  const returnPathState: ReturnPathState = { returnTo: `${pathname}${search}` };

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link
        to={`/work-orders/${workOrder.id}/edit`}
        state={returnPathState}
        aria-label={t("workOrders.actions.edit", { serialNumber: workOrder.deviceSerialNumber })}
      >
        <PencilIcon aria-hidden="true" />
      </Link>
    </Button>
  );
}
