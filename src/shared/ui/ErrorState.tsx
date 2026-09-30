import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 px-6 py-12 text-center"
    >
      <TriangleAlertIcon aria-hidden="true" className="size-10 text-destructive" />
      <h2 className="text-base font-medium">{title ?? t("states.errorTitle")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? t("states.errorDescription")}
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCwIcon aria-hidden="true" />
        {t("states.retry")}
      </Button>
    </div>
  );
}
