import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { type ApiClient, findWorkOrderId, signInToApi } from "./support/api";
import { type DemoRole, demoAccount } from "./support/environment";
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

type Screen = {
  name: string;
  role: DemoRole;
  heading: string;
  path: (api: ApiClient) => Promise<string> | string;
};

const screens: Screen[] = [
  { name: "dashboard", role: "dispatcher", heading: "Pulpit", path: () => "/" },
  { name: "work order list", role: "dispatcher", heading: "Zlecenia", path: () => "/work-orders" },
  {
    name: "work order details",
    role: "dispatcher",
    heading: "Zlecenie ZL/",
    path: async (api) => `/work-orders/${await findWorkOrderId(api, "Completed")}`,
  },
  {
    name: "dispatch board",
    role: "dispatcher",
    heading: "Tablica dispatch",
    path: () => "/dispatch",
  },
  { name: "client list", role: "dispatcher", heading: "Klienci", path: () => "/clients" },
  {
    name: "technician work orders",
    role: "technician",
    heading: "Moje zlecenia",
    path: () => "/my-work-orders",
  },
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("login screen has no serious accessibility violations", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByLabel("E-mail")).toBeVisible();

      expect(await blockingViolations(page)).toEqual([]);
    });

    for (const screen of screens) {
      test(`${screen.name} has no serious accessibility violations`, async ({ page }) => {
        const account = demoAccount(screen.role);
        const path = await screen.path(await signInToApi(account));

        await signIn(page, account, { path: `/login?returnTo=${encodeURIComponent(path)}` });
        await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
        await page.waitForLoadState("networkidle");
        await expect(page.getByText("Wczytywanie", { exact: false })).toHaveCount(0);

        expect(await blockingViolations(page)).toEqual([]);
      });
    }
  });
}
