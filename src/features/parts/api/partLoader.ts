import type { QueryClient } from "@tanstack/react-query";
import { data, type LoaderFunction } from "react-router";
import { partQueryOptions } from "@/features/parts/api/partQueries";
import { ApiError } from "@/shared/api/apiError";

export function createPartLoader(queryClient: QueryClient): LoaderFunction {
  return async ({ params }) => {
    try {
      await queryClient.query(partQueryOptions(params.partId ?? ""));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "notFound") {
        throw data(null, { status: 404 });
      }
      throw error;
    }
    return null;
  };
}
