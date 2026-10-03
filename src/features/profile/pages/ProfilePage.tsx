import { useTranslation } from "react-i18next";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import { isDemoAccountEmail } from "@/shared/lib/demoAccounts";
import { useCurrentUser } from "@/shared/session/currentUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PageTitle } from "@/shared/ui/PageTitle";

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();

  if (user === undefined) {
    return <ListSkeleton rows={3} />;
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageTitle title={t("profile.title")} />
      <h1 className="text-2xl font-semibold tracking-tight">{t("profile.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("profile.account.title")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="text-muted-foreground">{t("profile.account.fullName")}</dt>
            <dd className="font-medium">{user.fullName}</dd>
            <dt className="text-muted-foreground">{t("profile.account.email")}</dt>
            <dd className="font-medium break-all">{user.email}</dd>
            <dt className="text-muted-foreground">{t("profile.account.role")}</dt>
            <dd className="font-medium">{t(`roles.${user.role}`)}</dd>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("profile.password.title")}</h2>
          </CardTitle>
          <CardDescription>{t("profile.password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm isDemoAccount={isDemoAccountEmail(user.email)} />
        </CardContent>
      </Card>
    </div>
  );
}
