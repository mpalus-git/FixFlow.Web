import { LoaderCircleIcon, LogOutIcon, UserCogIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useCurrentUser } from "@/shared/session/currentUser";
import { logout } from "@/shared/session/logout";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function UserMenu() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (user === undefined) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("userMenu.label")}>
          <UserIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">{user.fullName}</span>
          <span className="truncate text-xs font-normal">{user.email}</span>
          <span className="text-xs font-normal">{t(`roles.${user.role}`)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserCogIcon aria-hidden="true" />
            {t("userMenu.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            setIsLoggingOut(true);
            void logout();
          }}
        >
          {isLoggingOut ? (
            <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
          ) : (
            <LogOutIcon aria-hidden="true" />
          )}
          {t(isLoggingOut ? "userMenu.loggingOut" : "userMenu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
