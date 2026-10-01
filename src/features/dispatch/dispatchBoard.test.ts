import {
  buildDispatchBoard,
  canDragWorkOrder,
  canDropWorkOrder,
  planDispatchMove,
} from "@/features/dispatch/dispatchBoard";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const piotr = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";
const ewa = "3c4d5e6f-7a8b-4c9d-8e0f-2a3b4c5d6e7f";
const activeTechnicians = new Set([anna, piotr]);
const now = new Date("2026-10-01T10:00:00Z");

const assignedToAnna = createWorkOrderListItem({
  id: "a1",
  status: "Assigned",
  technicianId: anna,
  dueDate: "2026-10-02T08:30:00Z",
});
const newOrder = createWorkOrderListItem({
  id: "n1",
  status: "New",
  technicianId: null,
  technicianEmail: null,
  dueDate: "2026-10-03T07:00:00Z",
});

describe("buildDispatchBoard", () => {
  const technicians = [
    { id: anna, email: "anna@fixflow.test", role: "Technician", isActive: true },
    { id: piotr, email: "piotr@fixflow.test", role: "Technician", isActive: true },
    { id: ewa, email: "ewa@fixflow.test", role: "Technician", isActive: false },
  ];

  it("places assigned work orders in the technician row on their Warsaw due day", () => {
    const lateEvening = createWorkOrderListItem({
      id: "a2",
      technicianId: anna,
      dueDate: "2026-09-29T22:30:00Z",
    });
    const board = buildDispatchBoard({
      weekStart: "2026-09-28",
      weekWorkOrders: [assignedToAnna, lateEvening, newOrder],
      unassignedWorkOrders: [newOrder],
      technicians,
    });

    expect(board.days).toHaveLength(7);
    expect(board.rows.map((row) => row.technician.email)).toEqual([
      "anna@fixflow.test",
      "piotr@fixflow.test",
    ]);
    expect(board.rows[0]?.workOrdersByDay["2026-09-30"]).toEqual([lateEvening]);
    expect(board.rows[0]?.workOrdersByDay["2026-10-02"]).toEqual([assignedToAnna]);
    expect(board.rows[1]?.workOrdersByDay["2026-10-03"]).toEqual([]);
    expect(board.unassigned).toEqual([newOrder]);
  });

  it("shows an inactive technician only when they have work orders in the week", () => {
    const completedByEwa = createWorkOrderListItem({
      id: "c1",
      status: "Completed",
      technicianId: ewa,
      dueDate: "2026-09-28T09:00:00Z",
    });
    const board = buildDispatchBoard({
      weekStart: "2026-09-28",
      weekWorkOrders: [completedByEwa],
      unassignedWorkOrders: [],
      technicians,
    });

    expect(board.rows.map((row) => row.technician.id)).toEqual([anna, piotr, ewa]);
  });

  it("sorts work orders by due date", () => {
    const later = createWorkOrderListItem({ id: "n2", dueDate: "2026-10-04T07:00:00Z" });
    const earlier = createWorkOrderListItem({ id: "n3", dueDate: "2026-09-01T07:00:00Z" });
    const board = buildDispatchBoard({
      weekStart: "2026-09-28",
      weekWorkOrders: [],
      unassignedWorkOrders: [later, earlier],
      technicians: [],
    });

    expect(board.unassigned).toEqual([earlier, later]);
  });
});

describe("canDragWorkOrder", () => {
  it.each([
    ["New", true],
    ["Assigned", true],
    ["InProgress", false],
    ["Completed", false],
    ["Invoiced", false],
  ] as const)("allows dragging a work order in the %s status: %s", (status, draggable) => {
    expect(canDragWorkOrder(createWorkOrderListItem({ status }))).toBe(draggable);
  });
});

describe("planDispatchMove", () => {
  it("assigns a new work order and keeps the due date on its own day", () => {
    expect(
      planDispatchMove(newOrder, { kind: "cell", technicianId: anna, day: "2026-10-03" }),
    ).toEqual({ dueDate: null, unassign: false, assignTo: anna });
  });

  it("moves the due date to another day keeping the Warsaw time", () => {
    expect(
      planDispatchMove(assignedToAnna, { kind: "cell", technicianId: anna, day: "2026-10-05" }),
    ).toEqual({ dueDate: "2026-10-05T08:30:00.000Z", unassign: false, assignTo: null });
  });

  it("changes the technician by unassigning and assigning again", () => {
    expect(
      planDispatchMove(assignedToAnna, { kind: "cell", technicianId: piotr, day: "2026-10-02" }),
    ).toEqual({ dueDate: null, unassign: true, assignTo: piotr });
  });

  it("unassigns an assigned work order dropped on the unassigned column", () => {
    expect(planDispatchMove(assignedToAnna, { kind: "unassigned" })).toEqual({
      dueDate: null,
      unassign: true,
      assignTo: null,
    });
  });
});

describe("canDropWorkOrder", () => {
  it("allows a move to a future day of an active technician", () => {
    expect(
      canDropWorkOrder(
        assignedToAnna,
        { kind: "cell", technicianId: piotr, day: "2026-10-04" },
        activeTechnicians,
        now,
      ),
    ).toBe(true);
  });

  it("rejects a drop on a past day", () => {
    expect(
      canDropWorkOrder(
        assignedToAnna,
        { kind: "cell", technicianId: anna, day: "2026-09-30" },
        activeTechnicians,
        now,
      ),
    ).toBe(false);
  });

  it("rejects a drop on today when the kept time has already passed", () => {
    const morning = createWorkOrderListItem({ ...assignedToAnna, dueDate: "2026-10-02T06:00:00Z" });
    const evening = createWorkOrderListItem({ ...assignedToAnna, dueDate: "2026-10-02T16:00:00Z" });
    const today = { kind: "cell", technicianId: anna, day: "2026-10-01" } as const;

    expect(canDropWorkOrder(morning, today, activeTechnicians, now)).toBe(false);
    expect(canDropWorkOrder(evening, today, activeTechnicians, now)).toBe(true);
  });

  it("rejects a drop on an inactive technician", () => {
    expect(
      canDropWorkOrder(
        newOrder,
        { kind: "cell", technicianId: ewa, day: "2026-10-03" },
        activeTechnicians,
        now,
      ),
    ).toBe(false);
  });

  it("rejects a drop that changes nothing", () => {
    expect(
      canDropWorkOrder(
        assignedToAnna,
        { kind: "cell", technicianId: anna, day: "2026-10-02" },
        activeTechnicians,
        now,
      ),
    ).toBe(false);
    expect(canDropWorkOrder(newOrder, { kind: "unassigned" }, activeTechnicians, now)).toBe(false);
  });

  it("rejects moving a work order that is already in progress", () => {
    const inProgress = createWorkOrderListItem({ ...assignedToAnna, status: "InProgress" });

    expect(
      canDropWorkOrder(
        inProgress,
        { kind: "cell", technicianId: anna, day: "2026-10-05" },
        activeTechnicians,
        now,
      ),
    ).toBe(false);
  });
});
