import { WrenchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { readDemoAccounts } from "@/shared/lib/demoAccounts";
import { readReturnTo } from "@/shared/lib/returnTo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageTitle } from "@/shared/ui/PageTitle";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = readReturnTo(searchParams.get("returnTo")) ?? "/";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <PageTitle title={t("auth.login.title")} />
        <WrenchIcon aria-hidden="true" className="mx-auto size-8 text-primary" />
        <CardTitle>
          <h1 className="text-xl font-semibold">{t("auth.login.title")}</h1>
        </CardTitle>
        <CardDescription>{t("auth.login.description")}</CardDescription>
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
  );
}
