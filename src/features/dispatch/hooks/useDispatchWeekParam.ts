import { useSearchParams } from "react-router";
import { isCalendarDate, todayCalendarDate, weekStartOf } from "@/shared/lib/dateTime";

export type DispatchWeek = {
  weekStart: string;
  currentWeekStart: string;
  setWeekStart: (weekStart: string) => void;
};

export function useDispatchWeekParam(): DispatchWeek {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentWeekStart = weekStartOf(todayCalendarDate());
  const week = searchParams.get("week");
  const weekStart = week !== null && isCalendarDate(week) ? weekStartOf(week) : currentWeekStart;

  function setWeekStart(nextWeekStart: string) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (nextWeekStart === currentWeekStart) {
        next.delete("week");
      } else {
        next.set("week", nextWeekStart);
      }
      return next;
    });
  }

  return { weekStart, currentWeekStart, setWeekStart };
}
