import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { findWorkOrderId, signInToApi } from "./support/api";
import { demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

const blockingImpacts = new Set(["serious", "critical"]);

async function blockingViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations
    .filter((violation) => blockingImpacts.has(violation.impact ?? ""))
    .map(
      (violation) =>
        `${violation.id} (${String(violation.impact)}): ${violation.nodes
          .map((node) => node.target.join(" "))
          .join(", ")}`,
    );
}

async function expectAccessibleScreen(page: Page, path: string, heading: string): Promise<void> {
  await test.step(path, async () => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Wczytywanie", { exact: false })).toHaveCount(0);
    expect.soft(await blockingViolations(page), path).toEqual([]);
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("login screen has no serious accessibility violations", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByLabel("E-mail")).toBeVisible();

      expect(await blockingViolations(page)).toEqual([]);
    });

    test("dispatcher screens have no serious accessibility violations", async ({ page }) => {
      const dispatcher = demoAccount("dispatcher");
      const workOrderId = await findWorkOrderId(await signInToApi(dispatcher), "Completed");
      await signIn(page, dispatcher);

      await expectAccessibleScreen(page, "/", "Pulpit");
      await expectAccessibleScreen(page, "/work-orders", "Zlecenia");
      await expectAccessibleScreen(page, `/work-orders/${workOrderId}`, "Szczegóły zlecenia");
      await expectAccessibleScreen(page, "/dispatch", "Tablica dispatch");
      await expectAccessibleScreen(page, "/clients", "Klienci");
    });

    test("technician work orders have no serious accessibility violations", async ({ page }) => {
      await signIn(page, demoAccount("technician"));

      await expectAccessibleScreen(page, "/my-work-orders", "Moje zlecenia");
    });
  });
}
