import type { QueryClient } from "@tanstack/react-query";
import { data, type LoaderFunction } from "react-router";
import { clientQueryOptions } from "@/features/clients/api/clientQueries";
import { ApiError } from "@/shared/api/apiError";

export function createClientLoader(queryClient: QueryClient): LoaderFunction {
  return async ({ params }) => {
    try {
      await queryClient.query(clientQueryOptions(params.clientId ?? ""));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "notFound") {
        throw data(null, { status: 404 });
      }
      throw error;
    }
    return null;
  };
}
