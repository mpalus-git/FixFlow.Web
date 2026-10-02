import { expect, test } from "@playwright/test";
import { demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

test("dispatcher signs in with the form and lands on the dashboard", async ({ page }) => {
  await signIn(page, demoAccount("dispatcher"));

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Pulpit" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tablica dispatch" })).toBeVisible();
});

test("technician signs in with the demo button and sees only own work orders", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Zaloguj jako technik" }).click();

  await expect(page).toHaveURL("/my-work-orders");
  await expect(page.getByRole("heading", { level: 1, name: "Moje zlecenia" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tablica dispatch" })).toHaveCount(0);
});

test("rejects invalid credentials without leaving the login page", async ({ page }) => {
  const unknownAccount = { email: "nobody@fixflow.local", password: "Wrong-password-1" };
  await signIn(page, unknownAccount, { expectSuccess: false });

  await expect(page.getByRole("alert")).toHaveText("Nieprawidłowy e-mail lub hasło.");
  await expect(page).toHaveURL(/\/login/);
});

test("returns to the requested page after signing in", async ({ page }) => {
  await page.goto("/clients");
  await expect(page).toHaveURL("/login?returnTo=%2Fclients");

  await signIn(page, demoAccount("dispatcher"), { navigate: false });

  await expect(page).toHaveURL("/clients");
  await expect(page.getByRole("heading", { level: 1, name: "Klienci" })).toBeVisible();
});
