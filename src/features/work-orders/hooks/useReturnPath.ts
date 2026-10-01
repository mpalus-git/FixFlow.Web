import { useLocation } from "react-router";
import { readReturnTo } from "@/shared/lib/returnTo";

export const workOrderListPath = "/work-orders";

export type ReturnPathState = { returnTo: string };

function readStateReturnTo(state: unknown): string | null {
  if (
    typeof state !== "object" ||
    state === null ||
    !("returnTo" in state) ||
    typeof state.returnTo !== "string"
  ) {
    return null;
  }
  return readReturnTo(state.returnTo);
}

export function useReturnPath(fallbackPath: string = workOrderListPath): string {
  return readStateReturnTo(useLocation().state) ?? fallbackPath;
}
