import { useTranslation } from "react-i18next";
import { type DemoAccount, demoDataResetUtc } from "@/shared/lib/demoAccounts";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatTime } from "@/shared/lib/dateTime";
import { Button } from "@/shared/ui/button";

const demoRoleTexts = {
  Dispatcher: { label: "auth.demo.dispatcher", hint: "auth.demo.dispatcherHint" },
  Technician: { label: "auth.demo.technician", hint: "auth.demo.technicianHint" },
} as const;

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
    <section aria-labelledby="demo-login-heading" className="flex flex-col gap-3">
      <h2 id="demo-login-heading" className="text-sm font-medium">
        {t("auth.demo.heading")}
      </h2>
      <div className="grid gap-2">
        {accounts.map((account) => {
          const isDispatcher = account.role === "Dispatcher";
          const texts = demoRoleTexts[account.role];
          const labelId = `demo-login-${account.role}-label`;
          const hintId = `demo-login-${account.role}-hint`;
          return (
            <Button
              key={account.role}
              type="button"
              variant={isDispatcher ? "default" : "outline"}
              disabled={disabled}
              aria-labelledby={labelId}
              aria-describedby={hintId}
              className="h-auto flex-col items-start gap-0.5 px-3 py-2 text-left whitespace-normal"
              onClick={() => {
                onSelect(account);
              }}
            >
              <span id={labelId}>{t(texts.label)}</span>
              <span
                id={hintId}
                className={
                  isDispatcher ? "text-xs font-normal" : "text-xs font-normal text-muted-foreground"
                }
              >
                {t(texts.hint)}
              </span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("auth.demo.resetNotice", { time: resetTime })}
      </p>
    </section>
  );
}
