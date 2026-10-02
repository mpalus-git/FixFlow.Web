import { expect, type Page } from "@playwright/test";
import type { DemoAccount } from "./environment";

export type SignInOptions = {
  path?: string;
  navigate?: boolean;
  expectSuccess?: boolean;
};

export async function signIn(
  page: Page,
  account: DemoAccount,
  { path = "/login", navigate = true, expectSuccess = true }: SignInOptions = {},
): Promise<void> {
  if (navigate) {
    await page.goto(path);
  }
  await page.getByLabel("E-mail").fill(account.email);
  await page.getByLabel("Hasło", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  if (expectSuccess) {
    await expect(page).not.toHaveURL(/\/login/);
  }
}
