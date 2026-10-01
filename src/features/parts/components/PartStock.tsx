import { PackageXIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { stockLevel } from "@/features/parts/partStock";
import { Badge } from "@/shared/ui/badge";

export type PartStockProps = {
  stockQuantity: number;
};

export function PartStock({ stockQuantity }: PartStockProps) {
  const { t } = useTranslation();
  const level = stockLevel(stockQuantity);

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {level === "out" ? (
        <Badge variant="destructive">
          <PackageXIcon aria-hidden="true" data-icon="inline-start" />
          {t("parts.stock.out")}
        </Badge>
      ) : null}
      {level === "low" ? (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <TriangleAlertIcon aria-hidden="true" data-icon="inline-start" />
          {t("parts.stock.low")}
        </Badge>
      ) : null}
      <span className="font-medium tabular-nums">
        {t("parts.stock.units", { count: stockQuantity })}
      </span>
    </span>
  );
}
