import { CircleCheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { readDemoAccounts } from "@/shared/lib/demoAccounts";
import { readReturnTo } from "@/shared/lib/returnTo";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageTitle } from "@/shared/ui/PageTitle";

const demoHighlights = ["dispatch", "details", "technician"] as const;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = readReturnTo(searchParams.get("returnTo")) ?? "/";

  return (
    <div className="grid w-full max-w-sm gap-6 lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-16">
      <PageTitle title={t("auth.login.title")} />
      <p className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:self-end lg:text-2xl">
        <BrandMark className="size-7" />
        {t("app.name")}
      </p>
      <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">{t("auth.login.title")}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm
            demoAccounts={readDemoAccounts()}
            onLoggedIn={() => {
              void navigate(returnTo, { replace: true });
            }}
          />
        </CardContent>
      </Card>
      <section aria-labelledby="login-intro-heading" className="flex flex-col gap-4 lg:self-start">
        <p className="text-sm text-muted-foreground lg:text-lg">{t("auth.intro.tagline")}</p>
        <h2 id="login-intro-heading" className="text-sm font-medium">
          {t("auth.intro.checklistTitle")}
        </h2>
        <ul className="flex flex-col gap-3">
          {demoHighlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <CircleCheckIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary-text"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t(`auth.intro.${highlight}.title`)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`auth.intro.${highlight}.description`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
