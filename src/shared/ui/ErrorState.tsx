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
  compact?: boolean;
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
  compact = false,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const heading = title ?? t("states.errorTitle");
  const message = description ?? t(descriptionKeyFor(error));
  const retryButton = (
    <Button
      variant="outline"
      size={compact ? "sm" : "default"}
      disabled={isRetryDisabled}
      onClick={onRetry}
    >
      <RefreshCwIcon aria-hidden="true" />
      {retryLabel ?? t("states.retry")}
    </Button>
  );

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-1 text-sm">
        <div role="alert" className="flex items-start gap-2">
          <TriangleAlertIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="flex flex-col gap-0.5">
            <p className="font-medium">{heading}</p>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
        {retryButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 px-6 py-12 text-center">
      <div role="alert" className="flex flex-col items-center gap-3">
        <TriangleAlertIcon aria-hidden="true" className="size-10 text-destructive" />
        <h2 className="text-base font-medium">{heading}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {retryButton}
    </div>
  );
}
