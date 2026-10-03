import { type Query, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isServerUnreachable } from "@/shared/api/apiError";

export const slowResponseThresholdMs = 5_000;

function isRetryingUnreachableServer(query: Query): boolean {
  return query.state.fetchFailureCount > 0 && isServerUnreachable(query.state.fetchFailureReason);
}

function useIsWaitingForServer(thresholdMs: number): boolean {
  const isBusy = useIsFetching() + useIsMutating() > 0;
  const [isWaitingLong, setIsWaitingLong] = useState(false);

  useEffect(() => {
    if (!isBusy) {
      return;
    }
    const timer = setTimeout(() => {
      setIsWaitingLong(true);
    }, thresholdMs);
    return () => {
      clearTimeout(timer);
      setIsWaitingLong(false);
    };
  }, [isBusy, thresholdMs]);

  return isBusy && isWaitingLong;
}

export function ServerWakeBanner() {
  const { t } = useTranslation();
  const isRetrying = useIsFetching({ predicate: isRetryingUnreachableServer }) > 0;
  const isWaiting = useIsWaitingForServer(slowResponseThresholdMs);
  const message = isRetrying
    ? {
        title: t("serverWake.sessionBannerTitle"),
        description: t("serverWake.sessionBannerDescription"),
      }
    : isWaiting
      ? {
          title: t("serverWake.slowBannerTitle"),
          description: t("serverWake.slowBannerDescription"),
        }
      : null;

  return (
    <div role="status" className="sticky top-14 z-30">
      {message && (
        <div className="flex items-start gap-3 border-b bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          <LoaderCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin" />
          <p>
            <span className="font-medium">{message.title}</span>{" "}
            <span className="text-muted-foreground">{message.description}</span>
          </p>
        </div>
      )}
    </div>
  );
}
