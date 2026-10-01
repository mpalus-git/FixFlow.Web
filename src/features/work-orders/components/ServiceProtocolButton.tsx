import { useMutation } from "@tanstack/react-query";
import { FileDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "@/shared/api/apiClient";
import { ApiError } from "@/shared/api/apiError";
import { unwrap } from "@/shared/api/baseClient";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { saveBlob } from "@/shared/lib/saveBlob";
import { Button } from "@/shared/ui/button";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

export type ServiceProtocolButtonProps = {
  workOrderId: string;
  status: WorkOrderStatus;
};

export function ServiceProtocolButton({ workOrderId, status }: ServiceProtocolButtonProps) {
  const { t } = useTranslation();
  const downloadMutation = useMutation({
    mutationFn: async () =>
      unwrap(
        await apiClient.GET("/api/v1/work-orders/{workOrderId}/protocol", {
          params: { path: { workOrderId } },
          parseAs: "blob",
        }),
      ),
    onSuccess: (pdf) => {
      saveBlob(pdf, `protokol-${workOrderId}.pdf`);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? describeApiError(error, t) : t("errors.unexpected"), {
        action: {
          label: t("states.retry"),
          onClick: () => {
            downloadMutation.mutate();
          },
        },
      });
    },
  });

  if (status !== "Completed" && status !== "Invoiced") {
    return null;
  }

  return (
    <Button
      variant="outline"
      disabled={downloadMutation.isPending}
      onClick={() => {
        downloadMutation.mutate();
      }}
    >
      <FileDownIcon aria-hidden="true" />
      {downloadMutation.isPending
        ? t("workOrders.protocol.downloading")
        : t("workOrders.protocol.download")}
    </Button>
  );
}
