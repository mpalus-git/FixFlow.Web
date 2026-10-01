import type { QueryClient } from "@tanstack/react-query";
import type { RouteObject } from "react-router";
import { AppLayout } from "@/app/layout/AppLayout";
import { PublicLayout } from "@/app/layout/PublicLayout";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import {
  createRedirectSignedIn,
  createRequireRole,
  createRequireSession,
} from "@/app/sessionMiddleware";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export function createRoutes(queryClient: QueryClient): RouteObject[] {
  return [
    {
      Component: PublicLayout,
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: ListSkeleton,
      children: [
        {
          path: "/login",
          middleware: [createRedirectSignedIn(queryClient)],
          lazy: {
            Component: async () => (await import("@/features/auth/pages/LoginPage")).LoginPage,
          },
        },
      ],
    },
    {
      path: "/",
      Component: AppLayout,
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: ListSkeleton,
      middleware: [createRequireSession(queryClient)],
      children: [
        {
          index: true,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          lazy: {
            Component: async () =>
              (await import("@/features/dashboard/pages/DashboardPage")).DashboardPage,
          },
        },
        {
          path: "my-work-orders",
          middleware: [createRequireRole(queryClient, ["Technician"])],
          lazy: {
            Component: async () =>
              (await import("@/features/work-orders/pages/MyWorkOrdersPage")).MyWorkOrdersPage,
          },
        },
        {
          path: "work-orders",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: {
                Component: async () =>
                  (await import("@/features/work-orders/pages/WorkOrdersPage")).WorkOrdersPage,
              },
            },
            {
              path: "new",
              lazy: {
                Component: async () =>
                  (await import("@/features/work-orders/pages/CreateWorkOrderPage"))
                    .CreateWorkOrderPage,
              },
            },
          ],
        },
        {
          path: "clients",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: {
                Component: async () =>
                  (await import("@/features/clients/pages/ClientsPage")).ClientsPage,
              },
            },
            {
              path: "new",
              lazy: {
                Component: async () =>
                  (await import("@/features/clients/pages/CreateClientPage")).CreateClientPage,
              },
            },
            {
              path: ":clientId",
              lazy: {
                loader: async () =>
                  (await import("@/features/clients/api/clientLoader")).createClientLoader(
                    queryClient,
                  ),
                Component: async () =>
                  (await import("@/features/clients/pages/ClientCardPage")).ClientCardPage,
              },
            },
            {
              path: ":clientId/devices/new",
              lazy: {
                loader: async () =>
                  (await import("@/features/clients/api/clientLoader")).createClientLoader(
                    queryClient,
                  ),
                Component: async () =>
                  (await import("@/features/devices/pages/CreateDevicePage")).CreateDevicePage,
              },
            },
            {
              path: ":clientId/edit",
              lazy: {
                loader: async () =>
                  (await import("@/features/clients/api/clientLoader")).createClientLoader(
                    queryClient,
                  ),
                Component: async () =>
                  (await import("@/features/clients/pages/EditClientPage")).EditClientPage,
              },
            },
          ],
        },
        {
          path: "devices",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: {
                Component: async () =>
                  (await import("@/features/devices/pages/DevicesPage")).DevicesPage,
              },
            },
            {
              path: ":deviceId",
              lazy: {
                loader: async () =>
                  (await import("@/features/devices/api/deviceLoader")).createDeviceLoader(
                    queryClient,
                  ),
                Component: async () =>
                  (await import("@/features/devices/pages/DeviceCardPage")).DeviceCardPage,
              },
            },
            {
              path: ":deviceId/edit",
              lazy: {
                loader: async () =>
                  (await import("@/features/devices/api/deviceLoader")).createDeviceLoader(
                    queryClient,
                  ),
                Component: async () =>
                  (await import("@/features/devices/pages/EditDevicePage")).EditDevicePage,
              },
            },
          ],
        },
        {
          path: "profile",
          lazy: {
            Component: async () =>
              (await import("@/features/profile/pages/ProfilePage")).ProfilePage,
          },
        },
        {
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ];
}
