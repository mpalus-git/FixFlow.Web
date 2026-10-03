import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { DispatchBoardGrid } from "@/features/dispatch/components/DispatchBoardGrid";
import { buildDispatchBoard, type DispatchWorkOrder } from "@/features/dispatch/dispatchBoard";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { Toaster } from "@/shared/ui/sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";
import { createWorkOrderListItem, createWorkOrderResponse } from "@/test/workOrderFixtures";

type AssignTechnicianRequest = components["schemas"]["AssignTechnicianRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const weekStart = "2026-09-28";
const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const piotr = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";
const technicians = [
  {
    id: anna,
    email: "anna@fixflow.test",
    fullName: "Anna Nowak",
    role: "Technician",
    isActive: true,
  },
  {
    id: piotr,
    email: "piotr@fixflow.test",
    fullName: "Piotr Zieliński",
    role: "Technician",
    isActive: true,
  },
];
const newOrder = createWorkOrderListItem({
  id: "6e5d4c3b-2a19-4f8e-9d7c-6b5a4f3e2d1c",
  clientName: "Hotel Zamek",
  status: "New",
  technicianId: null,
  technicianEmail: null,
  dueDate: "2026-10-02T08:00:00Z",
});
const inProgress = createWorkOrderListItem({
  clientName: "Piekarnia Kowalski",
  status: "InProgress",
  technicianId: anna,
  dueDate: "2026-10-01T06:00:00Z",
});

function rectAt(left: number, top: number, width: number, height: number): DOMRect {
  return DOMRect.fromRect({ x: left, y: top, width, height });
}

function layoutRect(element: Element): DOMRect {
  if (element instanceof HTMLElement && element.style.position === "fixed") {
    return rectAt(
      parseFloat(element.style.left),
      parseFloat(element.style.top),
      parseFloat(element.style.width),
      parseFloat(element.style.height),
    );
  }
  if (element.tagName === "SECTION") {
    return rectAt(0, 0, 700, 100);
  }
  const cell = element.closest("td");
  const row = cell?.parentElement;
  if (cell !== null && row instanceof HTMLTableRowElement) {
    const isCell = element === cell;
    return isCell
      ? rectAt(cell.cellIndex * 100, 100 + row.rowIndex * 100, 100, 100)
      : rectAt(cell.cellIndex * 100 + 10, 130 + row.rowIndex * 100, 80, 40);
  }
  const item = element.closest("li");
  if (item?.parentElement) {
    const index = [...item.parentElement.children].indexOf(item);
    return rectAt(10 + index * 100, 30, 80, 40);
  }
  return rectAt(0, 0, 0, 0);
}

function renderBoard(unassigned: DispatchWorkOrder[], week: DispatchWorkOrder[]) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return layoutRect(this);
  });
  const board = buildDispatchBoard({
    weekStart,
    weekWorkOrders: week,
    unassignedWorkOrders: unassigned,
    technicians,
  });
  renderWithProviders(
    <MemoryRouter>
      <DispatchBoardGrid board={board} weekStart={weekStart} />
      <Toaster />
    </MemoryRouter>,
  );
}

function mockAssign(respond: () => Response) {
  const assigned: string[] = [];
  const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${newOrder.id}`;
  server.use(
    http.get(workOrderUrl, () =>
      HttpResponse.json(
        createWorkOrderResponse({ id: newOrder.id, status: "New", dueDate: newOrder.dueDate }),
        { headers: { ETag: '"1"' } },
      ),
    ),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) => {
      assigned.push((await request.json()).technicianId);
      return respond();
    }),
  );
  return assigned;
}

function annaRow() {
  return screen.getByRole("row", { name: /anna@fixflow\.test/ });
}

async function dragNewOrderWithKeyboard(keys: string) {
  const user = userEvent.setup();
  screen.getByRole("button", { name: "Przenieś zlecenie Hotel Zamek, 02.10.2026 10:00" }).focus();
  await user.keyboard(`[Space]${keys}[Space]`);
}

describe("DispatchBoardGrid", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-01T08:00:00Z") });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the week of every technician and locks work orders already in progress", () => {
    renderBoard([newOrder], [inProgress]);

    expect(
      screen.getByRole("columnheader", { name: /czwartek 01\.10\.2026 · dziś/ }),
    ).toHaveAttribute("aria-current", "date");
    expect(within(annaRow()).getByRole("link", { name: "Piekarnia Kowalski" })).toBeInTheDocument();
    expect(
      within(annaRow()).getByText("Zlecenie w statusie W realizacji nie może być przeniesione"),
    ).toBeInTheDocument();
    expect(within(annaRow()).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nieprzypisane (1)" })).toBeInTheDocument();
  });

  it("assigns a new work order dragged with the keyboard onto a technician and day", async () => {
    const assigned = mockAssign(() =>
      HttpResponse.json(createWorkOrderResponse({ status: "Assigned", technicianId: anna }), {
        headers: { ETag: '"2"' },
      }),
    );
    renderBoard([newOrder], []);

    await dragNewOrderWithKeyboard("[ArrowDown][ArrowRight][ArrowRight]");

    await vi.waitFor(() => {
      expect(assigned).toEqual([anna]);
    });
  });

  it("does not move a work order dropped on a past day", async () => {
    const assigned = mockAssign(() => HttpResponse.json(null, { status: 500 }));
    renderBoard([newOrder], []);

    await dragNewOrderWithKeyboard("[ArrowDown]");

    expect(assigned).toEqual([]);
    expect(within(annaRow()).queryByRole("link")).not.toBeInTheDocument();
  });

  it("explains the error when the server rejects the move", async () => {
    mockAssign(() => {
      const problem: ProblemDetails = {
        status: 409,
        title: "Conflict",
        errorCode: "WorkOrder.InvalidStatusTransition",
      };
      return HttpResponse.json(problem, { status: 409 });
    });
    renderBoard([newOrder], []);

    await dragNewOrderWithKeyboard("[ArrowDown][ArrowRight][ArrowRight]");

    expect(
      await screen.findByText(
        "Status zlecenia zmienił się w międzyczasie i ta akcja nie jest już dostępna.",
      ),
    ).toBeInTheDocument();
  });
});
