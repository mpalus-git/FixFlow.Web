import type { QueryClient } from "@tanstack/react-query";
import { data, type LoaderFunction } from "react-router";
import { deviceQueryOptions } from "@/features/devices/api/deviceQueries";
import { ApiError } from "@/shared/api/apiError";

export function createDeviceLoader(queryClient: QueryClient): LoaderFunction {
  return async ({ params }) => {
    try {
      await queryClient.query(deviceQueryOptions(params.deviceId ?? ""));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "notFound") {
        throw data(null, { status: 404 });
      }
      throw error;
    }
    return null;
  };
}
