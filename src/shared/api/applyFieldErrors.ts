import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "@/shared/api/apiError";

export function applyFieldErrors<TValues extends FieldValues>(
  error: ApiError,
  fields: readonly Path<TValues>[],
  setError: UseFormSetError<TValues>,
): boolean {
  let isApplied = false;
  for (const field of fields) {
    const message = error.fieldErrors[field]?.[0];
    if (message !== undefined) {
      setError(field, { type: "server", message });
      isApplied = true;
    }
  }
  return isApplied;
}
