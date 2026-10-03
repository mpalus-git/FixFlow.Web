import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { NotFoundPage } from "@/app/NotFoundPage";
import { ApiError } from "@/shared/api/apiError";
import { ErrorState } from "@/shared/ui/ErrorState";

function reloadPage() {
  window.location.reload();
}

function useSecondsLeft(totalSeconds: number): number {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1_000);
    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  return secondsLeft;
}

type RateLimitedErrorProps = {
  retryAfterSeconds: number | null;
};

function RateLimitedError({ retryAfterSeconds }: RateLimitedErrorProps) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(retryAfterSeconds ?? 0);

  return (
    <ErrorState
      title={t("routeError.rateLimitedTitle")}
      description={
        retryAfterSeconds === null
          ? t("routeError.rateLimitedDescriptionWithoutDelay")
          : t("routeError.rateLimitedDescription", { seconds: retryAfterSeconds })
      }
      {...(secondsLeft > 0 && { retryLabel: t("routeError.retryIn", { seconds: secondsLeft }) })}
      isRetryDisabled={secondsLeft > 0}
      onRetry={reloadPage}
    />
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      {error instanceof ApiError && error.kind === "rateLimited" ? (
        <RateLimitedError retryAfterSeconds={error.retryAfterSeconds} />
      ) : (
        <ErrorState
          title={t("routeError.title")}
          description={t("routeError.description")}
          onRetry={reloadPage}
        />
      )}
    </div>
  );
}
