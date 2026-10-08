import { ArrowRightIcon, CalendarRangeIcon, WrenchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type DemoAccount, demoDataResetUtc } from "@/shared/lib/demoAccounts";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatTime } from "@/shared/lib/dateTime";
import { Button } from "@/shared/ui/button";

const demoRoleTexts = {
  Dispatcher: {
    label: "auth.demo.dispatcher",
    hint: "auth.demo.dispatcherHint",
    Icon: CalendarRangeIcon,
  },
  Technician: { label: "auth.demo.technician", hint: "auth.demo.technicianHint", Icon: WrenchIcon },
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
          const texts = demoRoleTexts[account.role];
          const labelId = `demo-login-${account.role}-label`;
          const hintId = `demo-login-${account.role}-hint`;
          return (
            <Button
              key={account.role}
              type="button"
              disabled={disabled}
              aria-labelledby={labelId}
              aria-describedby={hintId}
              className="h-auto justify-start gap-3 px-3 py-2.5 text-left whitespace-normal"
              onClick={() => {
                onSelect(account);
              }}
            >
              <texts.Icon aria-hidden="true" className="size-5" />
              <span className="flex flex-1 flex-col gap-0.5">
                <span id={labelId}>{t(texts.label)}</span>
                <span id={hintId} className="text-xs font-normal">
                  {t(texts.hint)}
                </span>
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="motion-safe:transition-transform motion-safe:group-hover/button:translate-x-0.5"
              />
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
