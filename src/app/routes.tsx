import type { QueryClient } from "@tanstack/react-query";
import type { RouteObject } from "react-router";
import { PublicLayout } from "@/app/layout/PublicLayout";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import {
  createRedirectSignedIn,
  createRequireRole,
  createRequireSession,
} from "@/app/sessionMiddleware";
import { createResourceLoader } from "@/shared/api/resourceLoader";
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
          lazy: async () => ({
            Component: (await import("@/features/auth/pages/LoginPage")).LoginPage,
          }),
        },
      ],
    },
    {
      path: "/",
      lazy: async () => ({
        Component: (await import("@/app/layout/AppLayout")).AppLayout,
      }),
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: ListSkeleton,
      middleware: [createRequireSession(queryClient)],
      children: [
        {
          index: true,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          lazy: async () => ({
            Component: (await import("@/features/dashboard/pages/DashboardPage")).DashboardPage,
          }),
        },
        {
          path: "my-work-orders",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Technician"])],
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/features/work-orders/pages/MyWorkOrdersPage"))
                  .MyWorkOrdersPage,
              }),
            },
            {
              path: ":workOrderId",
              lazy: {
                loader: async () => {
                  const { workOrderQueryOptions } =
                    await import("@/features/work-orders/api/workOrderQueries");
                  return createResourceLoader("workOrderId", (id) =>
                    queryClient.query(workOrderQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/work-orders/pages/WorkOrderDetailsPage"))
                    .WorkOrderDetailsPage,
              },
            },
          ],
        },
        {
          path: "work-orders",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/features/work-orders/pages/WorkOrdersPage"))
                  .WorkOrdersPage,
              }),
            },
            {
              path: "new",
              lazy: async () => ({
                Component: (await import("@/features/work-orders/pages/CreateWorkOrderPage"))
                  .CreateWorkOrderPage,
              }),
            },
            {
              path: ":workOrderId",
              lazy: {
                loader: async () => {
                  const { workOrderQueryOptions } =
                    await import("@/features/work-orders/api/workOrderQueries");
                  return createResourceLoader("workOrderId", (id) =>
                    queryClient.query(workOrderQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/work-orders/pages/WorkOrderDetailsPage"))
                    .WorkOrderDetailsPage,
              },
            },
            {
              path: ":workOrderId/edit",
              lazy: {
                loader: async () => {
                  const { workOrderQueryOptions } =
                    await import("@/features/work-orders/api/workOrderQueries");
                  return createResourceLoader("workOrderId", (id) =>
                    queryClient.query(workOrderQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/work-orders/pages/EditWorkOrderPage"))
                    .EditWorkOrderPage,
              },
            },
          ],
        },
        {
          path: "dispatch",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          lazy: async () => ({
            Component: (await import("@/features/dispatch/pages/DispatchPage")).DispatchPage,
          }),
        },
        {
          path: "clients",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/features/clients/pages/ClientsPage")).ClientsPage,
              }),
            },
            {
              path: "new",
              lazy: async () => ({
                Component: (await import("@/features/clients/pages/CreateClientPage"))
                  .CreateClientPage,
              }),
            },
            {
              path: ":clientId",
              lazy: {
                loader: async () => {
                  const { clientQueryOptions } =
                    await import("@/features/clients/api/clientQueries");
                  return createResourceLoader("clientId", (id) =>
                    queryClient.query(clientQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/clients/pages/ClientCardPage")).ClientCardPage,
              },
            },
            {
              path: ":clientId/devices/new",
              lazy: {
                loader: async () => {
                  const { clientQueryOptions } =
                    await import("@/features/clients/api/clientQueries");
                  return createResourceLoader("clientId", (id) =>
                    queryClient.query(clientQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/devices/pages/CreateDevicePage")).CreateDevicePage,
              },
            },
            {
              path: ":clientId/edit",
              lazy: {
                loader: async () => {
                  const { clientQueryOptions } =
                    await import("@/features/clients/api/clientQueries");
                  return createResourceLoader("clientId", (id) =>
                    queryClient.query(clientQueryOptions(id)),
                  );
                },
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
              lazy: async () => ({
                Component: (await import("@/features/devices/pages/DevicesPage")).DevicesPage,
              }),
            },
            {
              path: ":deviceId",
              lazy: {
                loader: async () => {
                  const { deviceQueryOptions } =
                    await import("@/features/devices/api/deviceQueries");
                  return createResourceLoader("deviceId", (id) =>
                    queryClient.query(deviceQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/devices/pages/DeviceCardPage")).DeviceCardPage,
              },
            },
            {
              path: ":deviceId/edit",
              lazy: {
                loader: async () => {
                  const { deviceQueryOptions } =
                    await import("@/features/devices/api/deviceQueries");
                  return createResourceLoader("deviceId", (id) =>
                    queryClient.query(deviceQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/devices/pages/EditDevicePage")).EditDevicePage,
              },
            },
          ],
        },
        {
          path: "parts",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin", "Dispatcher"])],
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/features/parts/pages/PartsPage")).PartsPage,
              }),
            },
            {
              path: "new",
              lazy: async () => ({
                Component: (await import("@/features/parts/pages/CreatePartPage")).CreatePartPage,
              }),
            },
            {
              path: ":partId/edit",
              lazy: {
                loader: async () => {
                  const { partQueryOptions } = await import("@/features/parts/api/partQueries");
                  return createResourceLoader("partId", (id) =>
                    queryClient.query(partQueryOptions(id)),
                  );
                },
                Component: async () =>
                  (await import("@/features/parts/pages/EditPartPage")).EditPartPage,
              },
            },
          ],
        },
        {
          path: "users",
          ErrorBoundary: RouteErrorBoundary,
          middleware: [createRequireRole(queryClient, ["Admin"])],
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/features/users/pages/UsersPage")).UsersPage,
              }),
            },
            {
              path: "new",
              lazy: async () => ({
                Component: (await import("@/features/users/pages/CreateUserPage")).CreateUserPage,
              }),
            },
          ],
        },
        {
          path: "profile",
          lazy: async () => ({
            Component: (await import("@/features/profile/pages/ProfilePage")).ProfilePage,
          }),
        },
        {
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ];
}
