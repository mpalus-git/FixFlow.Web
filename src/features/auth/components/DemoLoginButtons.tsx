import { useTranslation } from "react-i18next";
import { type DemoAccount, demoDataResetUtc } from "@/shared/lib/demoAccounts";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatTime } from "@/shared/lib/dateTime";
import { Button } from "@/shared/ui/button";

export type DemoLoginButtonsProps = {
  accounts: readonly DemoAccount[];
  disabled: boolean;
  onSelect: (account: DemoAccount) => void;
};

export function DemoLoginButtons({ accounts, disabled, onSelect }: DemoLoginButtonsProps) {
  const { t } = useTranslation();
  const language = useLanguage();

  if (accounts.length === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const resetTime = formatTime(`${today}T${demoDataResetUtc}`, language);

  return (
    <section aria-labelledby="demo-login-heading" className="flex flex-col gap-3 border-t pt-4">
      <h2 id="demo-login-heading" className="text-center text-sm text-muted-foreground">
        {t("auth.demo.heading")}
      </h2>
      <div className="grid gap-2">
        {accounts.map((account) => (
          <Button
            key={account.role}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              onSelect(account);
            }}
          >
            {t(account.role === "Dispatcher" ? "auth.demo.dispatcher" : "auth.demo.technician")}
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {t("auth.demo.resetNotice", { time: resetTime })}
      </p>
    </section>
  );
}
