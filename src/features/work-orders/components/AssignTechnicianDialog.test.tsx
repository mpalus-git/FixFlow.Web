import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { AssignTechnicianDialog } from "@/features/work-orders/components/AssignTechnicianDialog";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { Toaster } from "@/shared/ui/sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";
import { createWorkOrderResponse } from "@/test/workOrderFixtures";

type UserPage = components["schemas"]["PagedResponseOfUserResponse"];
type AssignTechnicianRequest = components["schemas"]["AssignTechnicianRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const workOrder = createWorkOrderResponse({ status: "New", technicianId: null });
const workOrderUrl = `${apiBaseUrl}/api/v1/work-orders/${workOrder.id}`;
const anna = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const piotr = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";

function mockApi(assignResponse?: () => Response) {
  const userRequests: URLSearchParams[] = [];
  const calls: string[] = [];
  const userPage: UserPage = {
    items: [
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
    ],
    page: 1,
    pageSize: 100,
    totalCount: 2,
  };
  server.use(
    http.get(`${apiBaseUrl}/api/v1/users`, ({ request }) => {
      userRequests.push(new URL(request.url).searchParams);
      return HttpResponse.json(userPage);
    }),
    http.get(workOrderUrl, () => HttpResponse.json(workOrder, { headers: { ETag: '"1"' } })),
    http.post(`${workOrderUrl}/unassign`, () => {
      calls.push("unassign");
      return HttpResponse.json(workOrder, { headers: { ETag: '"2"' } });
    }),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/reassign`, async ({ request }) => {
      const { technicianId } = await request.json();
      calls.push(`reassign ${technicianId}`);
      return HttpResponse.json(createWorkOrderResponse({ status: "Assigned", technicianId }), {
        headers: { ETag: '"3"' },
      });
    }),
    http.post<never, AssignTechnicianRequest>(`${workOrderUrl}/assign`, async ({ request }) => {
      const { technicianId } = await request.json();
      calls.push(`assign ${technicianId}`);
      return (
        assignResponse?.() ??
        HttpResponse.json(createWorkOrderResponse({ status: "Assigned", technicianId }), {
          headers: { ETag: '"3"' },
        })
      );
    }),
  );
  return { userRequests, calls };
}

function renderDialog(currentTechnicianId: string | null) {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  renderWithProviders(
    <>
      <AssignTechnicianDialog
        workOrderId={workOrder.id}
        currentTechnicianId={currentTechnicianId}
        open
        onOpenChange={onOpenChange}
      />
      <Toaster />
    </>,
  );
  return onOpenChange;
}

describe("AssignTechnicianDialog", () => {
  it("assigns one of the active technicians", async () => {
    const { userRequests, calls } = mockApi();
    const onOpenChange = renderDialog(null);
    const user = userEvent.setup();

    await screen.findByRole("option", { name: "Anna Nowak" });
    expect(screen.getByLabelText("Technik")).toHaveFocus();
    await user.selectOptions(screen.getByLabelText("Technik"), "Anna Nowak");
    await user.click(screen.getByRole("button", { name: "Przypisz" }));

    expect(await screen.findByText("Przypisano technika.")).toBeInTheDocument();
    expect(calls).toEqual([`assign ${anna}`]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(userRequests[0]?.get("isActive")).toBe("true");
  });

  it("changes the technician without offering the current one", async () => {
    const { calls } = mockApi();
    renderDialog(anna);
    const user = userEvent.setup();

    await screen.findByRole("option", { name: "Piotr Zieliński" });
    expect(screen.queryByRole("option", { name: "Anna Nowak" })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Technik"), "Piotr Zieliński");
    await user.click(screen.getByRole("button", { name: "Zmień technika" }));

    expect(await screen.findByText("Zmieniono technika.")).toBeInTheDocument();
    expect(calls).toEqual([`reassign ${piotr}`]);
  });

  it("asks for a technician before assigning", async () => {
    const { calls } = mockApi();
    renderDialog(null);

    await screen.findByRole("option", { name: "Anna Nowak" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Przypisz" }));

    expect(screen.getByText("To pole jest wymagane")).toBeInTheDocument();
    expect(calls).toEqual([]);
  });

  it("keeps the dialog open when the technician was deactivated in the meantime", async () => {
    mockApi(() => {
      const problem: ProblemDetails = {
        status: 404,
        title: "Not Found",
        errorCode: "WorkOrder.TechnicianNotFound",
      };
      return HttpResponse.json(problem, { status: 404 });
    });
    const onOpenChange = renderDialog(null);
    const user = userEvent.setup();

    await screen.findByRole("option", { name: "Anna Nowak" });
    await user.selectOptions(screen.getByLabelText("Technik"), "Anna Nowak");
    await user.click(screen.getByRole("button", { name: "Przypisz" }));

    expect(await screen.findByText("Wybrany technik nie jest już aktywny.")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
