import { expect, test } from "@playwright/test";
import { createClientWithDevice, signInToApi } from "./support/api";
import { demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

test("second dispatcher saving a stale client sees the conflict and reloads the current version", async ({
  browser,
}) => {
  const dispatcher = demoAccount("dispatcher");
  const { client } = await createClientWithDevice(await signInToApi(dispatcher));
  const editPath = `/clients/${client.id}/edit`;
  const loginPath = `/login?returnTo=${encodeURIComponent(editPath)}`;
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();

  await signIn(first, dispatcher, { path: loginPath });
  await signIn(second, dispatcher, { path: loginPath });
  await expect(first.getByLabel("Nazwa")).toHaveValue(client.name);
  await expect(second.getByLabel("Nazwa")).toHaveValue(client.name);

  const renamed = `${client.name} (zmieniony)`;
  await first.getByLabel("Nazwa").fill(renamed);
  await first.getByRole("button", { name: "Zapisz zmiany" }).click();
  await expect(first.getByRole("heading", { level: 1, name: renamed })).toBeVisible();

  await second.getByLabel("Osoba kontaktowa").fill("Piotr Nowy");
  await second.getByRole("button", { name: "Zapisz zmiany" }).click();
  const conflict = second.getByRole("alertdialog", { name: "Dane zmieniły się w międzyczasie" });
  await expect(conflict).toBeVisible();
  await conflict.getByRole("button", { name: "Wczytaj aktualną wersję" }).click();

  await expect(conflict).toBeHidden();
  await expect(second.getByLabel("Nazwa")).toHaveValue(renamed);
  await expect(second.getByLabel("Osoba kontaktowa")).toHaveValue("Anna Testowa");

  await second.getByLabel("Osoba kontaktowa").fill("Piotr Nowy");
  await second.getByRole("button", { name: "Zapisz zmiany" }).click();
  await expect(second.getByRole("heading", { level: 1, name: renamed })).toBeVisible();
  await expect(second.getByText("Piotr Nowy")).toBeVisible();

  await firstContext.close();
  await secondContext.close();
});
