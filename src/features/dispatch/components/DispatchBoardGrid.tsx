import {
  type Announcements,
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useMoveWorkOrderMutation } from "@/features/dispatch/api/useMoveWorkOrderMutation";
import {
  type DropState,
  UnassignedDropZone,
} from "@/features/dispatch/components/DispatchDropZones";
import {
  DispatchWorkOrderCard,
  DispatchWorkOrderCardOverlay,
  workOrderLabel,
} from "@/features/dispatch/components/DispatchWorkOrderCard";
import {
  dispatchCellId,
  DispatchWeekTable,
} from "@/features/dispatch/components/DispatchWeekTable";
import {
  canDropWorkOrder,
  type DispatchBoard,
  type DispatchTarget,
  type DispatchTechnician,
  type DispatchWorkOrder,
} from "@/features/dispatch/dispatchBoard";
import { describeMoveError } from "@/features/dispatch/describeMoveError";
import { dispatchKeyboardCoordinates } from "@/features/dispatch/dispatchKeyboardCoordinates";
import { useLanguage } from "@/shared/i18n/useLanguage";
import {
  formatCalendarDate,
  formatCalendarWeekday,
  todayCalendarDate,
} from "@/shared/lib/dateTime";

const unassignedId = "unassigned";

const collisionDetection: CollisionDetection = (args) =>
  args.pointerCoordinates === null ? closestCenter(args) : pointerWithin(args);

type DropTarget = { target: DispatchTarget; label: string; technician: DispatchTechnician | null };

type ActiveDrag = { workOrderId: string; startedAt: Date };

export type DispatchBoardGridProps = {
  board: DispatchBoard;
  weekStart: string;
};

export function DispatchBoardGrid({ board, weekStart }: DispatchBoardGridProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const moveMutation = useMoveWorkOrderMutation();
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: dispatchKeyboardCoordinates }),
  );
  const today = todayCalendarDate();
  const dayLabel = (day: string) =>
    `${formatCalendarWeekday(day, language)} ${formatCalendarDate(day, language)}`;

  const workOrders = new Map<string, DispatchWorkOrder>(
    [
      ...board.unassigned,
      ...board.rows.flatMap((row) => Object.values(row.workOrdersByDay).flat()),
    ].map((workOrder) => [workOrder.id, workOrder]),
  );
  const targets = new Map<string, DropTarget>([
    [
      unassignedId,
      {
        target: { kind: "unassigned" },
        label: t("dispatch.unassigned.title"),
        technician: null,
      },
    ],
    ...board.rows.flatMap(({ technician }) =>
      board.days.map((day): [string, DropTarget] => [
        dispatchCellId(technician.id, day),
        {
          target: { kind: "cell", technicianId: technician.id, day },
          label: t("dispatch.cell", { technician: technician.fullName, day: dayLabel(day) }),
          technician,
        },
      ]),
    ),
  ]);
  const activeTechnicianIds = new Set(
    board.rows.filter((row) => row.technician.isActive).map((row) => row.technician.id),
  );
  const activeWorkOrder = activeDrag === null ? undefined : workOrders.get(activeDrag.workOrderId);

  function canDrop(workOrderId: string, targetId: string | undefined, now: Date): boolean {
    const workOrder = workOrders.get(workOrderId);
    const dropTarget = targetId === undefined ? undefined : targets.get(targetId);
    return (
      workOrder !== undefined &&
      dropTarget !== undefined &&
      canDropWorkOrder(workOrder, dropTarget.target, activeTechnicianIds, now)
    );
  }

  function dropStateFor(targetId: string): DropState {
    if (activeDrag === null) {
      return "idle";
    }
    return canDrop(activeDrag.workOrderId, targetId, activeDrag.startedAt) ? "allowed" : "blocked";
  }

  function labelOf(workOrderId: string): string {
    const workOrder = workOrders.get(workOrderId);
    return workOrder === undefined ? "" : workOrderLabel(workOrder, language);
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("dispatch.dnd.picked", { workOrder: labelOf(String(active.id)) }),
    onDragOver: ({ active, over }) => {
      const workOrderId = String(active.id);
      const targetId = over === null ? undefined : String(over.id);
      const label = targetId === undefined ? undefined : targets.get(targetId)?.label;
      if (label === undefined) {
        return t("dispatch.dnd.outside", { workOrder: labelOf(workOrderId) });
      }
      const key = canDrop(workOrderId, targetId, new Date())
        ? "dispatch.dnd.over"
        : "dispatch.dnd.overBlocked";
      return t(key, { workOrder: labelOf(workOrderId), target: label });
    },
    onDragEnd: ({ active, over }) => {
      const workOrderId = String(active.id);
      const targetId = over === null ? undefined : String(over.id);
      const label = targetId === undefined ? undefined : targets.get(targetId)?.label;
      return label !== undefined && canDrop(workOrderId, targetId, new Date())
        ? t("dispatch.dnd.dropped", { workOrder: labelOf(workOrderId), target: label })
        : t("dispatch.dnd.notDropped", { workOrder: labelOf(workOrderId) });
    },
    onDragCancel: ({ active }) =>
      t("dispatch.dnd.cancelled", { workOrder: labelOf(String(active.id)) }),
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDrag(null);
    const workOrder = workOrders.get(String(active.id));
    const dropTarget = over === null ? undefined : targets.get(String(over.id));
    if (
      workOrder === undefined ||
      dropTarget === undefined ||
      !canDropWorkOrder(workOrder, dropTarget.target, activeTechnicianIds, new Date())
    ) {
      return;
    }
    moveMutation.mutate(
      {
        workOrder,
        target: dropTarget.target,
        technician: dropTarget.technician,
        weekStart,
      },
      {
        onError: (error) => {
          toast.error(describeMoveError(error, t));
        },
      },
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t("dispatch.dnd.instructions") },
      }}
      onDragStart={({ active }) => {
        setActiveDrag({ workOrderId: String(active.id), startedAt: new Date() });
      }}
      onDragCancel={() => {
        setActiveDrag(null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <UnassignedDropZone
          id={unassignedId}
          dropState={dropStateFor(unassignedId)}
          count={board.unassigned.length}
        >
          {board.unassigned.map((workOrder) => (
            <li key={workOrder.id}>
              <DispatchWorkOrderCard workOrder={workOrder} showDate />
            </li>
          ))}
        </UnassignedDropZone>
        <DispatchWeekTable board={board} today={today} dropStateFor={dropStateFor} />
      </div>
      <DragOverlay>
        {activeWorkOrder === undefined ? null : (
          <DispatchWorkOrderCardOverlay
            workOrder={activeWorkOrder}
            showDate={activeWorkOrder.technicianId === null}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
