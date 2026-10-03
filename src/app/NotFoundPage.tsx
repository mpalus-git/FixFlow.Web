import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";
import { PageTitle } from "@/shared/ui/PageTitle";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <PageTitle title={t("notFound.title")} />
      <p className="text-5xl font-semibold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("notFound.title")}</h1>
      <p className="max-w-sm text-muted-foreground">{t("notFound.description")}</p>
      <Button asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
}
