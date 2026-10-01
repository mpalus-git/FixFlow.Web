import type { TFunction } from "i18next";
import {
  PartialDispatchMoveError,
  StaleDispatchBoardError,
} from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";

export function describeMoveError(error: unknown, t: TFunction): string {
  if (error instanceof StaleDispatchBoardError) {
    return t("dispatch.errors.changed");
  }
  if (error instanceof PartialDispatchMoveError) {
    return t("dispatch.errors.partial", { reason: describeMoveError(error.cause, t) });
  }
  if (error instanceof ApiError) {
    return error.status === 412 ? t("dispatch.errors.changed") : describeApiError(error, t);
  }
  return t("errors.unexpected");
}
