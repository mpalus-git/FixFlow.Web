import { useTranslation } from "react-i18next";
import { DispatchCell, type DropState } from "@/features/dispatch/components/DispatchDropZones";
import { DispatchWorkOrderCard } from "@/features/dispatch/components/DispatchWorkOrderCard";
import type { DispatchBoard } from "@/features/dispatch/dispatchBoard";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { formatCalendarDate, formatCalendarWeekday } from "@/shared/lib/dateTime";
import { Badge } from "@/shared/ui/badge";

type TechnicianEmailProps = {
  email: string;
};

function TechnicianEmail({ email }: TechnicianEmailProps) {
  const at = email.indexOf("@");
  if (at < 0) {
    return <span className="block [overflow-wrap:anywhere]">{email}</span>;
  }
  return (
    <span className="block [overflow-wrap:anywhere]">
      {email.slice(0, at)}
      <wbr />
      {email.slice(at)}
    </span>
  );
}

export function dispatchCellId(technicianId: string, day: string): string {
  return `${technicianId}/${day}`;
}

export type DispatchWeekTableProps = {
  board: DispatchBoard;
  today: string;
  dropStateFor: (cellId: string) => DropState;
};

export function DispatchWeekTable({ board, today, dropStateFor }: DispatchWeekTableProps) {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <div className="relative overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[60rem] table-fixed border-collapse text-sm">
        <caption className="sr-only">{t("dispatch.title")}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 w-28 bg-background p-2 text-left font-medium sm:w-36"
            >
              {t("dispatch.technician")}
            </th>
            {board.days.map((day) => (
              <th
                key={day}
                scope="col"
                className="border-l p-2 text-left font-medium"
                aria-current={day === today ? "date" : undefined}
              >
                <span className="block capitalize">{formatCalendarWeekday(day, language)}</span>{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {formatCalendarDate(day, language)}
                  {day === today ? ` · ${t("dispatch.today")}` : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.rows.map(({ technician, workOrdersByDay }) => (
            <tr key={technician.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 border-t bg-background p-2 text-left align-top font-normal"
              >
                <TechnicianEmail email={technician.email} />
                {technician.isActive ? null : (
                  <Badge variant="outline" className="mt-1 text-muted-foreground">
                    {t("dispatch.inactiveTechnician")}
                  </Badge>
                )}
              </th>
              {board.days.map((day) => {
                const cellId = dispatchCellId(technician.id, day);
                return (
                  <DispatchCell
                    key={day}
                    id={cellId}
                    dropState={dropStateFor(cellId)}
                    isPast={day < today}
                    isToday={day === today}
                  >
                    {(workOrdersByDay[day] ?? []).map((workOrder) => (
                      <DispatchWorkOrderCard
                        key={workOrder.id}
                        workOrder={workOrder}
                        showDate={false}
                      />
                    ))}
                  </DispatchCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
