import type { RouteObject } from "react-router";
import { AppLayout } from "@/app/layout/AppLayout";
import { PublicLayout } from "@/app/layout/PublicLayout";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export function createRoutes(): RouteObject[] {
  return [
    {
      Component: PublicLayout,
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: ListSkeleton,
      children: [
        {
          path: "/login",
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
      children: [
        {
          index: true,
          lazy: {
            Component: async () =>
              (await import("@/features/dashboard/pages/DashboardPage")).DashboardPage,
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
