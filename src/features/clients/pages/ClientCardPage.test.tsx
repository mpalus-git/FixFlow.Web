import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { endSession } from "@/shared/session/sessionStore";
import { createClientResponse } from "@/test/clientFixtures";
import { createDeviceResponse } from "@/test/deviceFixtures";
import { renderApp } from "@/test/renderApp";
import { server } from "@/test/server";
import { signInAs } from "@/test/signedInUser";
import { createWorkOrderListItem } from "@/test/workOrderFixtures";

type ClientResponse = components["schemas"]["ClientResponse"];
type ClientPage = components["schemas"]["PagedResponseOfClientResponse"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceResponse"];
type WorkOrderPage = components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const client = createClientResponse();
const clientUrl = `${apiBaseUrl}/api/v1/clients/${client.id}`;
const cardPath = `/clients/${client.id}`;

function mockCard(cardClient: ClientResponse = client) {
  const devicePage: DevicePage = {
    items: [createDeviceResponse()],
    page: 1,
    pageSize: 10,
    totalCount: 1,
  };
  const workOrderPage: WorkOrderPage = {
    items: [createWorkOrderListItem()],
    page: 1,
    pageSize: 10,
    totalCount: 1,
  };
  const clientPage: ClientPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
  server.use(
    http.get(clientUrl, () => HttpResponse.json(cardClient, { headers: { ETag: '"1"' } })),
    http.get(`${apiBaseUrl}/api/v1/devices`, () => HttpResponse.json(devicePage)),
    http.get(`${apiBaseUrl}/api/v1/work-orders`, () => HttpResponse.json(workOrderPage)),
    http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(clientPage)),
  );
}

describe("ClientCardPage", () => {
  beforeEach(() => {
    signInAs("Dispatcher");
  });

  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("shows the client details, devices and work order history", async () => {
    mockCard();
    renderApp(cardPath);

    expect(
      await screen.findByRole("heading", { name: "Piekarnia Kowalski", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mariacka 12A, 40-014 Katowice")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+48 600 100 200" })).toHaveAttribute(
      "href",
      "tel:+48 600 100 200",
    );
    expect(screen.getByRole("link", { name: "biuro@piekarnia.test" })).toHaveAttribute(
      "href",
      "mailto:biuro@piekarnia.test",
    );
    const devices = screen.getByRole("region", { name: "Urządzenia" });
    expect(await within(devices).findByRole("cell", { name: "SN-2024-0001" })).toBeVisible();
    const history = screen.getByRole("region", { name: "Historia zleceń" });
    expect(await within(history).findByText("Kocioł nie grzeje wody użytkowej")).toBeVisible();
  });

  it("opens from the client list by the client name", async () => {
    mockCard();
    const clientPage: ClientPage = { items: [client], page: 1, pageSize: 20, totalCount: 1 };
    server.use(http.get(`${apiBaseUrl}/api/v1/clients`, () => HttpResponse.json(clientPage)));
    const user = userEvent.setup();
    const router = renderApp("/clients");

    await user.click(await screen.findByRole("link", { name: "Piekarnia Kowalski" }));

    expect(
      await screen.findByRole("heading", { name: "Piekarnia Kowalski", level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(cardPath);
  });

  it("shows an archived client without actions and explains the missing devices", async () => {
    mockCard({ ...client, archivedAt: "2026-09-20T10:00:00Z" });
    renderApp(cardPath);

    expect(await screen.findByText("Zarchiwizowany")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edytuj" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Archiwizuj" })).toBeNull();
    expect(screen.getByRole("note")).toHaveTextContent("zarchiwizowane razem z nim");
    const history = screen.getByRole("region", { name: "Historia zleceń" });
    expect(await within(history).findByText("Kocioł nie grzeje wody użytkowej")).toBeVisible();
  });

  it("returns to the list after archiving the client from the card", async () => {
    mockCard();
    server.use(http.post(`${clientUrl}/archive`, () => new HttpResponse(null, { status: 204 })));
    const user = userEvent.setup();
    const router = renderApp(cardPath);

    await user.click(await screen.findByRole("button", { name: "Archiwizuj" }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Archiwizuj" }));

    expect(await screen.findByRole("heading", { name: "Klienci" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/clients");
    expect(screen.getByText("Zarchiwizowano klienta Piekarnia Kowalski.")).toBeInTheDocument();
  });

  it("shows the not found page for a client that does not exist", async () => {
    const problem: ProblemDetails = { status: 404, title: "Not Found" };
    server.use(http.get(clientUrl, () => HttpResponse.json(problem, { status: 404 })));
    renderApp(cardPath);

    expect(
      await screen.findByRole("heading", { name: "Nie znaleziono strony" }),
    ).toBeInTheDocument();
  });
});
