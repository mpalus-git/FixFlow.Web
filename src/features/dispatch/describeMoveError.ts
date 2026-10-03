import type { TFunction } from "i18next";
import { StaleDispatchBoardError } from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";

export function describeMoveError(error: unknown, t: TFunction): string {
  if (error instanceof StaleDispatchBoardError) {
    return t("dispatch.errors.changed");
  }
  if (error instanceof ApiError) {
    return describeApiError(error, t);
  }
  return t("errors.unexpected");
}
