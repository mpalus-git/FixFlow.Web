import { type Query, useIsFetching } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isServerUnreachable } from "@/shared/api/apiError";

function isRetryingUnreachableServer(query: Query): boolean {
  return query.state.fetchFailureCount > 0 && isServerUnreachable(query.state.fetchFailureReason);
}

export function ServerWakeBanner() {
  const { t } = useTranslation();
  const retryingCount = useIsFetching({ predicate: isRetryingUnreachableServer });

  return (
    <div role="status" className="sticky top-14 z-30">
      {retryingCount > 0 && (
        <div className="flex items-start gap-3 border-b bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          <LoaderCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin" />
          <p>
            <span className="font-medium">{t("serverWake.sessionBannerTitle")}</span>{" "}
            <span className="text-muted-foreground">
              {t("serverWake.sessionBannerDescription")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
