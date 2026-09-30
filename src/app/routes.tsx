import type { RouteObject } from "react-router";
import { AppLayout } from "@/app/layout/AppLayout";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export function createRoutes(): RouteObject[] {
  return [
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
