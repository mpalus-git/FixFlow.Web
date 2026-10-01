import type { QueryClient } from "@tanstack/react-query";
import { data, type LoaderFunction } from "react-router";
import { workOrderQueryOptions } from "@/features/work-orders/api/workOrderQueries";
import { ApiError } from "@/shared/api/apiError";

export function createWorkOrderLoader(queryClient: QueryClient): LoaderFunction {
  return async ({ params }) => {
    try {
      await queryClient.query(workOrderQueryOptions(params.workOrderId ?? ""));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "notFound") {
        throw data(null, { status: 404 });
      }
      throw error;
    }
    return null;
  };
}
