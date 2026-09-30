import {
  formatCalendarDate,
  formatDate,
  formatDateTime,
  formatTime,
  isCalendarDate,
  todayCalendarDate,
  toUtcIso,
} from "@/shared/lib/dateTime";

describe("dateTime", () => {
  it("runs tests in a browser time zone different from Warsaw", () => {
    expect(new Date("2026-01-15T12:00:00Z").getTimezoneOffset()).toBe(300);
  });

  describe("formatDateTime", () => {
    it("shows a winter UTC timestamp in Warsaw time", () => {
      expect(formatDateTime("2026-01-15T13:30:00Z", "pl")).toBe("15.01.2026 14:30");
    });

    it("shows a summer UTC timestamp in Warsaw time", () => {
      expect(formatDateTime("2026-07-15T13:30:00Z", "pl")).toBe("15.07.2026 15:30");
    });

    it("moves a late evening UTC timestamp to the next Warsaw day", () => {
      expect(formatDateTime("2026-07-15T22:30:00Z", "pl")).toBe("16.07.2026 00:30");
    });

    it("formats with the English locale", () => {
      expect(formatDateTime("2026-01-15T13:30:00Z", "en")).toBe("01/15/2026 2:30 PM");
    });

    it("throws on an invalid timestamp", () => {
      expect(() => formatDateTime("not a date", "pl")).toThrow(RangeError);
    });
  });

  describe("formatTime", () => {
    it("shows the Warsaw time of a UTC timestamp", () => {
      expect(formatTime("2026-07-15T02:00:00Z", "pl")).toBe("04:00");
      expect(formatTime("2026-01-15T02:00:00Z", "en")).toBe("3:00 AM");
    });
  });

  describe("formatDate", () => {
    it("uses the Warsaw calendar day of a UTC timestamp", () => {
      expect(formatDate("2026-03-28T23:30:00Z", "pl")).toBe("29.03.2026");
    });
  });

  describe("formatCalendarDate", () => {
    it("keeps the calendar day regardless of the browser time zone", () => {
      expect(formatCalendarDate("2026-03-15", "pl")).toBe("15.03.2026");
    });

    it("formats with the English locale", () => {
      expect(formatCalendarDate("2026-03-15", "en")).toBe("03/15/2026");
    });

    it("throws on a value that is not yyyy-MM-dd", () => {
      expect(() => formatCalendarDate("2026-03-15T00:00:00Z", "pl")).toThrow(RangeError);
    });
  });

  describe("toUtcIso", () => {
    it("converts Warsaw winter time to UTC", () => {
      expect(toUtcIso("2026-01-15T14:30")).toBe("2026-01-15T13:30:00.000Z");
    });

    it("converts Warsaw summer time to UTC", () => {
      expect(toUtcIso("2026-07-15T15:30")).toBe("2026-07-15T13:30:00.000Z");
    });

    it("converts the first hour after the spring clock change", () => {
      expect(toUtcIso("2026-03-29T03:00")).toBe("2026-03-29T01:00:00.000Z");
    });

    it("throws on a value without time", () => {
      expect(() => toUtcIso("2026-01-15")).toThrow(RangeError);
    });
  });
});

describe("todayCalendarDate", () => {
  it("already returns the next day in Warsaw late on a summer evening in UTC", () => {
    expect(todayCalendarDate(new Date("2026-07-15T22:30:00Z"))).toBe("2026-07-16");
  });

  it("already returns the next day in Warsaw late on a winter evening in UTC", () => {
    expect(todayCalendarDate(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-16");
  });

  it("returns the same day while it is still that day in Warsaw", () => {
    expect(todayCalendarDate(new Date("2026-07-15T21:30:00Z"))).toBe("2026-07-15");
  });
});

describe("isCalendarDate", () => {
  it("accepts an existing calendar date", () => {
    expect(isCalendarDate("2024-02-29")).toBe(true);
  });

  it.each(["2026-02-29", "2026-13-01", "2026-1-5", "15.07.2026", ""])("rejects %s", (value) => {
    expect(isCalendarDate(value)).toBe(false);
  });
});
