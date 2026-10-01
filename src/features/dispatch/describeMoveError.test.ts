import i18next from "i18next";
import {
  PartialDispatchMoveError,
  StaleDispatchBoardError,
} from "@/features/dispatch/api/useMoveWorkOrderMutation";
import { describeMoveError } from "@/features/dispatch/describeMoveError";
import { ApiError } from "@/shared/api/apiError";

const changed = "Zlecenie zmieniło się w międzyczasie. Tablica pokazuje teraz aktualny stan.";

describe("describeMoveError", () => {
  it("explains that the work order changed when the board was out of date", () => {
    expect(describeMoveError(new StaleDispatchBoardError(), i18next.t)).toBe(changed);
  });

  it("explains that the work order changed when the API rejects the version", () => {
    const error = new ApiError({ kind: "preconditionFailed", status: 412 });

    expect(describeMoveError(error, i18next.t)).toBe(changed);
  });

  it("names the reason of a partial move", () => {
    const cause = new ApiError({
      kind: "notFound",
      status: 404,
      errorCode: "WorkOrder.TechnicianNotFound",
    });

    expect(describeMoveError(new PartialDispatchMoveError(cause), i18next.t)).toBe(
      `Zlecenie zostało zmienione tylko częściowo: ${i18next.t("apiErrors.workOrderTechnicianNotFound")}`,
    );
  });

  it("falls back to a generic message for an unknown error", () => {
    expect(describeMoveError(new Error("boom"), i18next.t)).toBe(i18next.t("errors.unexpected"));
  });
});
