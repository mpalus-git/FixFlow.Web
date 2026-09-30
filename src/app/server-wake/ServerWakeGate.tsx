import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AppBrand } from "@/app/layout/AppBrand";
import type { ServerReadyCheck } from "@/app/server-wake/checkServerReady";
import { useServerWake } from "@/app/server-wake/useServerWake";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Progress } from "@/shared/ui/progress";

const expectedWakeMs = 60_000;
const maxShownProgress = 0.95;

export type ServerWakeGateProps = {
  children: ReactNode;
  checkReady?: ServerReadyCheck;
};

export function ServerWakeGate({ children, checkReady }: ServerWakeGateProps) {
  const { t } = useTranslation();
  const { status, elapsedMs, retry } = useServerWake(checkReady);

  if (status === "ready") {
    return children;
  }

  const progress = Math.round(Math.min(elapsedMs / expectedWakeMs, maxShownProgress) * 100);

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <AppBrand />
        {status === "checking" ? (
          <p role="status" className="text-sm text-muted-foreground">
            {t("serverWake.checking")}
          </p>
        ) : null}
        {status === "waking" ? (
          <div className="flex w-full flex-col items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">{t("serverWake.wakingTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("serverWake.wakingDescription")}</p>
            <Progress value={progress} aria-label={t("serverWake.progressLabel")} />
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("serverWake.elapsed", { seconds: Math.floor(elapsedMs / 1000) })}
            </p>
          </div>
        ) : null}
        {status === "unavailable" ? (
          <ErrorState
            title={t("serverWake.unavailableTitle")}
            description={t("serverWake.unavailableDescription")}
            onRetry={retry}
          />
        ) : null}
      </div>
    </main>
  );
}
