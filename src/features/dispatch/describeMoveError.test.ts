import i18next from "i18next";
import { StaleDispatchBoardError } from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { describeMoveError } from "@/features/dispatch/describeMoveError";
import { ApiError } from "@/shared/api/apiError";

const changed = "Zlecenie zmieniło się w międzyczasie. Tablica pokazuje teraz aktualny stan.";

describe("describeMoveError", () => {
  it("explains that the work order changed when the board was out of date", () => {
    expect(describeMoveError(new StaleDispatchBoardError(), i18next.t)).toBe(changed);
  });

  it("describes an API error by its code", () => {
    const error = new ApiError({
      kind: "conflict",
      status: 409,
      errorCode: "WorkOrder.NotReassignable",
    });

    expect(describeMoveError(error, i18next.t)).toBe(
      i18next.t("apiErrors.workOrderNotReassignable"),
    );
  });

  it("falls back to a generic message for an unknown error", () => {
    expect(describeMoveError(new Error("boom"), i18next.t)).toBe(i18next.t("errors.unexpected"));
  });
});
