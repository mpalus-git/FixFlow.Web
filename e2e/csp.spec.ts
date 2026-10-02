import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { z } from "zod";
import {
  createClientWithDevice,
  createWorkOrder,
  futureWarsawDateTime,
  signInToApi,
} from "./support/api";
import { apiUrl, appUrl, demoAccount } from "./support/environment";
import { signIn } from "./support/signIn";

const productionApiUrl = "https://fixflow-api-us2p.onrender.com";

const vercelConfigSchema = z.object({
  headers: z.array(
    z.object({
      source: z.string(),
      headers: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
  ),
});

function productionContentSecurityPolicy(): string {
  const config = vercelConfigSchema.parse(JSON.parse(readFileSync("vercel.json", "utf8")));
  const policy = config.headers
    .find((rule) => rule.source === "/(.*)")
    ?.headers.find((header) => header.key === "Content-Security-Policy")?.value;
  if (policy === undefined) {
    throw new Error("vercel.json does not define Content-Security-Policy for all pages");
  }
  return policy;
}

test("production content security policy does not block the application", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["local-network-access"]);
  const policy = productionContentSecurityPolicy();
  expect(policy).toContain(`connect-src 'self' ${productionApiUrl}`);
  const localPolicy = policy.replace(productionApiUrl, apiUrl);
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      violations.push(message.text());
    }
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(
        `Content Security Policy violation: ${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  await page.route(`${appUrl}/**`, async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.fallback();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": localPolicy },
    });
  });
  const dispatcher = demoAccount("dispatcher");
  const api = await signInToApi(dispatcher);
  const { device } = await createClientWithDevice(api);
  const workOrder = await createWorkOrder(api, device.id, futureWarsawDateTime(4));

  await signIn(page, dispatcher);
  await expect(page.getByRole("heading", { level: 1, name: "Pulpit" })).toBeVisible();
  await page.getByRole("link", { name: "Tablica dispatch" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tablica dispatch" })).toBeVisible();
  await page.goto(`/work-orders/${workOrder.id}`);
  await page.getByRole("button", { name: "Przypisz technika" }).click();
  const dialog = page.getByRole("dialog", { name: "Przypisz technika" });
  await dialog.getByLabel("Technik").selectOption({ label: "technician@fixflow.local" });
  await dialog.getByRole("button", { name: "Przypisz" }).click();
  await expect(page.getByText("Przypisano technika.")).toBeVisible();

  expect(violations).toEqual([]);
});
