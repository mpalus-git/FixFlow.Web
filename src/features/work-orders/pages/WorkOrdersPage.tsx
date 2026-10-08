import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { WorkOrderList } from "@/features/work-orders/components/WorkOrderList";
import {
  type ReturnPathState,
  workOrderListPath,
} from "@/features/work-orders/hooks/useReturnPath";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";

export function WorkOrdersPage() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const returnPathState: ReturnPathState = { returnTo: `${workOrderListPath}${search}` };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("workOrders.title")}
        actions={
          <Button asChild>
            <Link to={`${workOrderListPath}/new`} state={returnPathState}>
              <PlusIcon aria-hidden="true" />
              {t("workOrders.create.title")}
            </Link>
          </Button>
        }
      />
      <WorkOrderList scope="all" />
    </div>
  );
}
