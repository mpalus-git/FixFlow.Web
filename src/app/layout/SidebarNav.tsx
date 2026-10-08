import { cn } from "cn";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { navItemsFor } from "@/app/layout/navItems";
import { useCurrentUser } from "@/shared/session/currentUser";

export type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const visibleItems = user === undefined ? [] : navItemsFor(user.role);

  return (
    <nav aria-label={t("nav.label")}>
      <ul className="flex flex-col gap-1">
        {visibleItems.map(({ to, labelKey, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
                  isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon aria-hidden="true" className="size-4" />
              {t(labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
