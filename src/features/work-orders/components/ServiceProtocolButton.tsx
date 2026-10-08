import { useMutation } from "@tanstack/react-query";
import { FileDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { saveBlob } from "@/shared/lib/saveBlob";
import { Button } from "@/shared/ui/button";

type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];

function protocolFileName(workOrderNumber: string): string {
  return `protokol-${workOrderNumber.replaceAll("/", "-")}.pdf`;
}

export type ServiceProtocolButtonProps = {
  workOrderId: string;
  workOrderNumber: string;
  status: WorkOrderStatus;
};

export function ServiceProtocolButton({
  workOrderId,
  workOrderNumber,
  status,
}: ServiceProtocolButtonProps) {
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
      saveBlob(pdf, protocolFileName(workOrderNumber));
    },
    onError: (error) => {
      toast.error(describeApiError(error, t), {
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
