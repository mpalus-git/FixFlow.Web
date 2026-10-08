import {
  Building2Icon,
  CalendarRangeIcon,
  ClipboardListIcon,
  CpuIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";
import type { NavigationPage } from "@/app/navigationPages";
import type { Role } from "@/shared/session/currentUser";

export const navItems: readonly {
  to: string;
  labelKey:
    | "nav.dashboard"
    | "nav.workOrders"
    | "nav.dispatch"
    | "nav.myWorkOrders"
    | "nav.clients"
    | "nav.devices"
    | "nav.parts"
    | "nav.users";
  icon: typeof LayoutDashboardIcon;
  page: NavigationPage;
  end: boolean;
  roles: readonly Role[];
}[] = [
  {
    to: "/",
    page: "dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboardIcon,
    end: true,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/work-orders",
    page: "workOrders",
    labelKey: "nav.workOrders",
    icon: ClipboardListIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/dispatch",
    page: "dispatch",
    labelKey: "nav.dispatch",
    icon: CalendarRangeIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/clients",
    page: "clients",
    labelKey: "nav.clients",
    icon: Building2Icon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/devices",
    page: "devices",
    labelKey: "nav.devices",
    icon: CpuIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/parts",
    page: "parts",
    labelKey: "nav.parts",
    icon: PackageIcon,
    end: false,
    roles: ["Admin", "Dispatcher"],
  },
  {
    to: "/users",
    page: "users",
    labelKey: "nav.users",
    icon: UsersIcon,
    end: false,
    roles: ["Admin"],
  },
  {
    to: "/my-work-orders",
    page: "myWorkOrders",
    labelKey: "nav.myWorkOrders",
    icon: ClipboardListIcon,
    end: false,
    roles: ["Technician"],
  },
];

export function navItemsFor(role: Role) {
  return navItems.filter((item) => item.roles.includes(role));
}
