import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import {
  type ReturnPathState,
  workOrderListPath,
} from "@/features/work-orders/hooks/useReturnPath";
import { Button } from "@/shared/ui/button";

export type NewWorkOrderLinkProps = {
  clientId: string;
  deviceId: string;
};

export function NewWorkOrderLink({ clientId, deviceId }: NewWorkOrderLinkProps) {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const returnPathState: ReturnPathState = { returnTo: `${pathname}${search}` };
  const query = new URLSearchParams({ clientId, deviceId }).toString();

  return (
    <Button variant="outline" asChild>
      <Link to={`${workOrderListPath}/new?${query}`} state={returnPathState}>
        <PlusIcon aria-hidden="true" />
        {t("workOrders.create.title")}
      </Link>
    </Button>
  );
}
