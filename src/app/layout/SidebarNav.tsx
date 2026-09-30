import { cn } from "cn";
import { LayoutDashboardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const navItems = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboardIcon, end: true },
] as const;

export type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("nav.label")}>
      <ul className="flex flex-col gap-1">
        {navItems.map(({ to, labelKey, icon: Icon, end }) => (
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
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
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
