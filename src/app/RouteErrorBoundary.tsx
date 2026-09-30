import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { NotFoundPage } from "@/app/NotFoundPage";
import { ErrorState } from "@/shared/ui/ErrorState";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <ErrorState
        title={t("routeError.title")}
        description={t("routeError.description")}
        onRetry={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
