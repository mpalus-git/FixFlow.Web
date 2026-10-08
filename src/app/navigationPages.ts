export const navigationPages = {
  dashboard: () => import("@/features/dashboard/pages/DashboardPage"),
  workOrders: () => import("@/features/work-orders/pages/WorkOrdersPage"),
  myWorkOrders: () => import("@/features/work-orders/pages/MyWorkOrdersPage"),
  dispatch: () => import("@/features/dispatch/pages/DispatchPage"),
  clients: () => import("@/features/clients/pages/ClientsPage"),
  devices: () => import("@/features/devices/pages/DevicesPage"),
  parts: () => import("@/features/parts/pages/PartsPage"),
  users: () => import("@/features/users/pages/UsersPage"),
};

export type NavigationPage = keyof typeof navigationPages;
