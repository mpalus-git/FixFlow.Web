import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/shared/api/apiError";
import { Button } from "@/shared/ui/button";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  error?: unknown;
  retryLabel?: string;
  isRetryDisabled?: boolean;
  onRetry: () => void;
};

function descriptionKeyFor(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "states.errorDescription";
  }
  switch (error.kind) {
    case "network":
      return "states.errorNetwork";
    case "server":
      return "states.errorServer";
    case "serverUnavailable":
      return "states.errorServerUnavailable";
    case "forbidden":
      return "states.errorForbidden";
    default:
      return "states.errorDescription";
  }
}

export function ErrorState({
  title,
  description,
  error,
  retryLabel,
  isRetryDisabled = false,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 px-6 py-12 text-center">
      <div role="alert" className="flex flex-col items-center gap-3">
        <TriangleAlertIcon aria-hidden="true" className="size-10 text-destructive" />
        <h2 className="text-base font-medium">{title ?? t("states.errorTitle")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {description ?? t(descriptionKeyFor(error))}
        </p>
      </div>
      <Button variant="outline" disabled={isRetryDisabled} onClick={onRetry}>
        <RefreshCwIcon aria-hidden="true" />
        {retryLabel ?? t("states.retry")}
      </Button>
    </div>
  );
}
