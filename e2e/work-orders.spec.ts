import { expect, test } from "@playwright/test";
import { formatDateTime, toUtcIso } from "@/shared/lib/dateTime";
import {
  createClientWithDevice,
  futureWarsawDateTime,
  signInToApi,
  uniqueSuffix,
} from "./support/api";
import { demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

test("dispatcher creates a work order and finds it on the list", async ({ page }) => {
  const dispatcher = demoAccount("dispatcher");
  const { client, device } = await createClientWithDevice(await signInToApi(dispatcher));
  const description = `Brak ciepłej wody ${uniqueSuffix()}`;
  const dueDate = futureWarsawDateTime(3, "14:30");

  await signIn(page, dispatcher, { path: "/login?returnTo=%2Fwork-orders" });
  await page.getByRole("link", { name: "Nowe zlecenie" }).click();
  await page.getByRole("combobox", { name: "Klient" }).fill(client.name);
  await page.getByRole("option", { name: client.name }).click();
  await page.getByRole("combobox", { name: "Urządzenie" }).fill(device.serialNumber);
  await page
    .getByRole("option", {
      name: `${device.serialNumber} · ${device.manufacturer} ${device.model}`,
    })
    .click();
  await page.getByLabel("Opis usterki").fill(description);
  await page.getByLabel("Priorytet").selectOption({ label: "Wysoki" });
  await page.getByLabel("Termin").fill(dueDate);
  await page.getByRole("button", { name: "Utwórz zlecenie" }).click();

  await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]{36}$/);
  const heading = page.getByRole("heading", { level: 1, name: /^Zlecenie ZL\/\d{4}\/\d{4}$/ });
  await expect(heading).toBeVisible();
  const number = (await heading.textContent())?.replace("Zlecenie ", "") ?? "";
  const details = page.getByRole("definition");
  await expect(details.filter({ hasText: description })).toBeVisible();
  await expect(details.filter({ hasText: client.name })).toBeVisible();
  const formattedDueDate = formatDateTime(toUtcIso(dueDate), "pl");
  await expect(details.filter({ hasText: formattedDueDate }).first()).toBeVisible();
  const history = page.getByRole("list", { name: "Historia zmian zlecenia" });
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(history).toContainText("Utworzono zlecenie");
  await expect(history).toContainText(formattedDueDate);

  await page.getByRole("link", { name: "Wróć" }).click();
  await page.getByLabel("Szukaj zleceń").fill(number);
  const rows = page.getByRole("row").filter({ hasText: number });
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Nowe");
  await expect(rows.first()).toContainText("Wysoki");
});
