import { EllipsisIcon, KeyRoundIcon, PencilIcon, UserCheckIcon, UserXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserAccountProtection } from "@/features/users/userRules";
import type { components } from "@/shared/api/schema";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

type UserResponse = components["schemas"]["UserResponse"];

export type UserRowActionsProps = {
  user: UserResponse;
  protection: UserAccountProtection;
  onDeactivate: (user: UserResponse) => void;
  onActivate: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onChangeName: (user: UserResponse) => void;
};

export function UserRowActions({
  user,
  protection,
  onDeactivate,
  onActivate,
  onResetPassword,
  onChangeName,
}: UserRowActionsProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("users.actions.label", { email: user.email })}
        >
          <EllipsisIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-72">
        <DropdownMenuItem
          onSelect={() => {
            onChangeName(user);
          }}
        >
          <PencilIcon aria-hidden="true" />
          {t("users.actions.changeName")}
        </DropdownMenuItem>
        {user.isActive ? (
          <DropdownMenuItem
            variant="destructive"
            disabled={protection !== null}
            onSelect={() => {
              onDeactivate(user);
            }}
          >
            <UserXIcon aria-hidden="true" />
            {t("users.actions.deactivate")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => {
              onActivate(user);
            }}
          >
            <UserCheckIcon aria-hidden="true" />
            {t("users.actions.activate")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={protection !== null}
          onSelect={() => {
            onResetPassword(user);
          }}
        >
          <KeyRoundIcon aria-hidden="true" />
          {t("users.actions.resetPassword")}
        </DropdownMenuItem>
        {protection === null ? null : (
          <DropdownMenuLabel className="text-xs font-normal whitespace-normal text-muted-foreground">
            {t(`users.protection.${protection}`)}
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
