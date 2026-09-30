import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";

type Values = { email: string; password: string };

describe("applyFieldErrors", () => {
  it("sets the first server message on each matching form field", () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    const error = new ApiError({
      kind: "validation",
      fieldErrors: {
        email: ["'Email' is not a valid email address.", "Second message"],
        unknownField: ["Ignored"],
      },
    });

    const isApplied = applyFieldErrors<Values>(error, ["email", "password"], setError);

    expect(isApplied).toBe(true);
    expect(setError).toHaveBeenCalledOnce();
    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "'Email' is not a valid email address.",
    });
  });

  it("reports that nothing was applied when no field matches", () => {
    const setError = vi.fn<UseFormSetError<Values>>();

    const isApplied = applyFieldErrors<Values>(
      new ApiError({ kind: "validation", fieldErrors: { other: ["Message"] } }),
      ["email", "password"],
      setError,
    );

    expect(isApplied).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
