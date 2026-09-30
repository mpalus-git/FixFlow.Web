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
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ];
}
