import { cn } from "cn";
import { Building2Icon, ClipboardListIcon, CpuIcon, LayoutDashboardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { type Role, useCurrentUser } from "@/shared/session/currentUser";

const navItems: readonly {
  to: string;
  labelKey: "nav.dashboard" | "nav.workOrders" | "nav.myWorkOrders" | "nav.clients" | "nav.devices";
  icon: typeof LayoutDashboardIcon;
  end: boolean;
  roles: readonly Role[];
}[] = [
  {
    to: "/",
    labelKey: "nav.dashboard",
    icon: LayoutDashboardIcon,
    end: true,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/work-orders",
    labelKey: "nav.workOrders",
    icon: ClipboardListIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/clients",
    labelKey: "nav.clients",
    icon: Building2Icon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/devices",
    labelKey: "nav.devices",
    icon: CpuIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/my-work-orders",
    labelKey: "nav.myWorkOrders",
    icon: ClipboardListIcon,
    end: false,
    roles: ["Technician"],
  },
];

export type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const visibleItems = navItems.filter(
    (item) => user !== undefined && item.roles.includes(user.role),
  );

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
