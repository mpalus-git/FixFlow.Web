import {
  addCalendarDays,
  calendarDateOf,
  formatCalendarDate,
  formatDate,
  formatDateTime,
  formatTime,
  isCalendarDate,
  isLocalDateTime,
  todayCalendarDate,
  toLocalDateTimeInput,
  toUtcIso,
  weekDays,
  weekStartOf,
  withCalendarDate,
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

describe("toLocalDateTimeInput", () => {
  it("shows a UTC timestamp as Warsaw local time for a date and time field", () => {
    expect(toLocalDateTimeInput("2026-07-15T13:30:00Z")).toBe("2026-07-15T15:30");
    expect(toLocalDateTimeInput("2026-01-15T23:30:00Z")).toBe("2026-01-16T00:30");
  });

  it("drops seconds, so an untouched field differs from the original timestamp", () => {
    expect(toLocalDateTimeInput("2026-10-01T08:05:42.123Z")).toBe("2026-10-01T10:05");
  });
});

describe("isLocalDateTime", () => {
  it("accepts an existing Warsaw date and time", () => {
    expect(isLocalDateTime("2026-10-25T02:30")).toBe(true);
  });

  it.each(["2026-03-29T02:30", "2026-02-30T10:00", "2026-10-01T24:00", "2026-10-01", ""])(
    "rejects %s",
    (value) => {
      expect(isLocalDateTime(value)).toBe(false);
    },
  );
});

describe("calendarDateOf", () => {
  it("returns the Warsaw calendar day of a UTC timestamp", () => {
    expect(calendarDateOf("2026-07-15T22:30:00Z")).toBe("2026-07-16");
    expect(calendarDateOf("2026-01-15T22:30:00Z")).toBe("2026-01-15");
  });
});

describe("addCalendarDays", () => {
  it("moves across month and year boundaries", () => {
    expect(addCalendarDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addCalendarDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("keeps the day across the clock changes", () => {
    expect(addCalendarDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addCalendarDays("2026-10-25", 1)).toBe("2026-10-26");
  });

  it("throws on a value that is not a calendar date", () => {
    expect(() => addCalendarDays("2026-02-30", 1)).toThrow(RangeError);
  });
});

describe("weekStartOf", () => {
  it("returns the Monday of the week", () => {
    expect(weekStartOf("2026-10-01")).toBe("2026-09-28");
    expect(weekStartOf("2026-09-28")).toBe("2026-09-28");
  });

  it("treats Sunday as the last day of the week", () => {
    expect(weekStartOf("2026-10-04")).toBe("2026-09-28");
  });
});

describe("weekDays", () => {
  it("returns seven consecutive days starting on the given Monday", () => {
    expect(weekDays("2026-10-19")).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });
});

describe("withCalendarDate", () => {
  it("moves a timestamp to another day keeping the Warsaw time", () => {
    expect(withCalendarDate("2026-10-01T08:05:42.123Z", "2026-10-03")).toBe(
      "2026-10-03T08:05:42.123Z",
    );
  });

  it("keeps the Warsaw time when moving across the autumn clock change", () => {
    expect(withCalendarDate("2026-10-23T08:00:00Z", "2026-10-26")).toBe("2026-10-26T09:00:00.000Z");
  });

  it("keeps the Warsaw day of a timestamp that is still the previous day in UTC", () => {
    expect(withCalendarDate("2026-07-15T22:30:00Z", "2026-07-20")).toBe("2026-07-19T22:30:00.000Z");
  });
});
