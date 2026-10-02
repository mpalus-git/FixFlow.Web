import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import { apiUrl, appUrl, demoAccount } from "./e2e/support/environment";

const envFile = "e2e/.env";
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const isCi = Boolean(process.env.CI);
const dispatcher = demoAccount("dispatcher");
const technician = demoAccount("technician");

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: isCi ? 2 : "50%",
  globalTimeout: isCi ? 600_000 : 0,
  reporter: isCi
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: appUrl,
    locale: "pl-PL",
    timezoneId: "America/New_York",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm preview --port 4173 --strictPort",
    url: appUrl,
    reuseExistingServer: !isCi,
    timeout: 180_000,
    env: {
      API_PROXY_TARGET: "",
      VITE_API_URL: apiUrl,
      VITE_DEMO_DISPATCHER_EMAIL: dispatcher.email,
      VITE_DEMO_DISPATCHER_PASSWORD: dispatcher.password,
      VITE_DEMO_TECHNICIAN_EMAIL: technician.email,
      VITE_DEMO_TECHNICIAN_PASSWORD: technician.password,
    },
  },
});
