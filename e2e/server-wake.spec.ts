import { expect, type Page, test } from "@playwright/test";

type SleepingServer = {
  wakeUp: () => void;
  readyChecks: () => number;
};

async function simulateSleepingServer(page: Page): Promise<SleepingServer> {
  let asleep = true;
  let checks = 0;
  await page.route("**/api/v1/system/ready", async (route) => {
    checks += 1;
    if (!asleep) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 503,
      contentType: "text/html",
      body: "<!doctype html><title>Application loading</title>",
    });
  });
  return {
    wakeUp: () => {
      asleep = false;
    },
    readyChecks: () => checks,
  };
}

test("shows the wake-up screen while the demo server starts and then the login form", async ({
  page,
}) => {
  const server = await simulateSleepingServer(page);

  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Serwer demo się uruchamia" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole("progressbar", { name: "Postęp uruchamiania serwera" }),
  ).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveCount(0);
  await expect.poll(server.readyChecks).toBeGreaterThan(1);

  server.wakeUp();

  await expect(page.getByLabel("E-mail")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Serwer demo się uruchamia" })).toHaveCount(0);
});

test("offers a retry when the demo server does not start within 90 seconds", async ({ page }) => {
  const server = await simulateSleepingServer(page);
  await page.clock.install();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Serwer demo się uruchamia" })).toBeVisible({
    timeout: 10_000,
  });
  for (let elapsed = 0; elapsed <= 90_000; elapsed += 3_000) {
    await page.clock.runFor(3_000);
  }

  await expect(page.getByRole("heading", { name: "Serwer nie odpowiada" })).toBeVisible();
  server.wakeUp();
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();

  await expect(page.getByLabel("E-mail")).toBeVisible({ timeout: 10_000 });
});
