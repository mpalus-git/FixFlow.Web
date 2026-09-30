import { Outlet, type RouteObject } from "react-router";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Outlet,
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
