import { useDroppable } from "@dnd-kit/core";
import { cn } from "cn";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type DropState = "idle" | "allowed" | "blocked";

function useDropZone(id: string, dropState: DropState) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const className = cn(
    "transition-colors",
    dropState === "allowed" && "bg-primary/5 ring-1 ring-primary/30 ring-inset",
    dropState === "allowed" && isOver && "bg-primary/15 ring-2 ring-primary",
    dropState === "blocked" && isOver && "bg-destructive/10 ring-2 ring-destructive/60",
  );
  return { setNodeRef, className };
}

export type DispatchCellProps = {
  id: string;
  dropState: DropState;
  isPast: boolean;
  isToday: boolean;
  children: ReactNode;
};

export function DispatchCell({ id, dropState, isPast, isToday, children }: DispatchCellProps) {
  const { setNodeRef, className } = useDropZone(id, dropState);

  return (
    <td
      ref={setNodeRef}
      className={cn(
        "h-24 border-t border-l p-1 align-top",
        isPast && "bg-muted/40",
        isToday && "bg-primary/5",
        className,
      )}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </td>
  );
}

export type UnassignedDropZoneProps = {
  id: string;
  dropState: DropState;
  count: number;
  children: ReactNode;
};

export function UnassignedDropZone({ id, dropState, count, children }: UnassignedDropZoneProps) {
  const { t } = useTranslation();
  const { setNodeRef, className } = useDropZone(id, dropState);

  return (
    <section
      ref={setNodeRef}
      aria-labelledby="dispatch-unassigned-title"
      className={cn("flex flex-col gap-3 rounded-xl border p-3", className)}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="dispatch-unassigned-title" className="text-base font-medium">
          {t("dispatch.unassigned.title")} ({count})
        </h2>
        <p className="text-sm text-muted-foreground">{t("dispatch.unassigned.description")}</p>
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground">{t("dispatch.unassigned.empty")}</p>
      ) : (
        <ul className="grid max-h-64 grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2 overflow-y-auto">
          {children}
        </ul>
      )}
    </section>
  );
}
