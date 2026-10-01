import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { WorkOrderList } from "@/features/work-orders/components/WorkOrderList";
import {
  type ReturnPathState,
  workOrderListPath,
} from "@/features/work-orders/hooks/useReturnPath";
import { Button } from "@/shared/ui/button";

export function WorkOrdersPage() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const returnPathState: ReturnPathState = { returnTo: `${workOrderListPath}${search}` };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t("workOrders.title")}</h1>
        <Button asChild>
          <Link to={`${workOrderListPath}/new`} state={returnPathState}>
            <PlusIcon aria-hidden="true" />
            {t("workOrders.create.title")}
          </Link>
        </Button>
      </div>
      <WorkOrderList scope="all" />
    </div>
  );
}
