import { data, type LoaderFunctionArgs } from "react-router";
import { ApiError } from "@/shared/api/apiError";

export function createResourceLoader(
  paramName: string,
  loadResource: (resourceId: string) => Promise<unknown>,
) {
  return async ({ params }: Pick<LoaderFunctionArgs, "params">): Promise<null> => {
    try {
      await loadResource(params[paramName] ?? "");
    } catch (error) {
      if (error instanceof ApiError && error.kind === "notFound") {
        throw data(null, { status: 404 });
      }
      throw error;
    }
    return null;
  };
}
