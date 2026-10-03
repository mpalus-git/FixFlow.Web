import i18next from "i18next";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";

describe("describeApiError", () => {
  it("translates a known error code", () => {
    const error = new ApiError({
      kind: "conflict",
      errorCode: "Client.Archived",
      detail: "Archived client cannot be modified.",
    });

    expect(describeApiError(error, i18next.t)).toBe(
      "Klient jest zarchiwizowany i nie można go zmieniać.",
    );
  });

  it("falls back to the detail from the API for an unknown error code", () => {
    const error = new ApiError({
      kind: "conflict",
      errorCode: "Client.Unknown",
      detail: "Something specific happened.",
    });

    expect(describeApiError(error, i18next.t)).toBe("Something specific happened.");
  });

  it("describes a network error without details", () => {
    expect(describeApiError(new ApiError({ kind: "network" }), i18next.t)).toBe(
      "Brak połączenia z serwerem. Serwer demo mógł zostać uśpiony - spróbuj ponownie za chwilę.",
    );
  });

  it("asks to try again later while the demo server is starting", () => {
    expect(describeApiError(new ApiError({ kind: "serverUnavailable" }), i18next.t)).toBe(
      "Serwer demo się uruchamia. Spróbuj ponownie za chwilę.",
    );
  });
});
