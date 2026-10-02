import { expect, test } from "@playwright/test";
import { calendarDateOf, weekDays, weekStartOf } from "@/shared/lib/dateTime";
import {
  createClientWithDevice,
  createWorkOrder,
  futureWarsawDateTime,
  getWorkOrder,
  signInToApi,
} from "./support/api";
import { demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

test.use({ viewport: { width: 1440, height: 1200 } });

test("dispatcher assigns a new work order by dragging it onto a technician's day", async ({
  page,
}) => {
  const dispatcher = demoAccount("dispatcher");
  const api = await signInToApi(dispatcher);
  const { client, device } = await createClientWithDevice(api);
  const workOrder = await createWorkOrder(api, device.id, futureWarsawDateTime(2, "09:15"));
  const dueDay = calendarDateOf(workOrder.dueDate);
  const weekStart = weekStartOf(dueDay);
  const dayIndex = weekDays(weekStart).indexOf(dueDay);

  await signIn(page, dispatcher, {
    path: `/login?returnTo=${encodeURIComponent(`/dispatch?week=${weekStart}`)}`,
  });

  const unassigned = page.getByRole("region", { name: /Nieprzypisane/ });
  const handle = unassigned.getByRole("button", { name: `Przenieś zlecenie ${client.name}, ` });
  const technicianRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: "technician@fixflow.local" }) });
  const targetCell = technicianRow.getByRole("cell").nth(dayIndex);

  await handle.hover();
  await page.mouse.down();
  const target = await targetCell.boundingBox();
  if (target === null) {
    throw new Error("Target cell is not visible");
  }
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(targetCell.getByRole("link", { name: client.name })).toBeVisible();
  await expect(unassigned.getByRole("link", { name: client.name })).toHaveCount(0);
  await expect.poll(async () => (await getWorkOrder(api, workOrder.id)).status).toBe("Assigned");

  await page.reload();
  await expect(targetCell.getByRole("link", { name: client.name })).toBeVisible();
  expect((await getWorkOrder(api, workOrder.id)).dueDate).toBe(workOrder.dueDate);
});
