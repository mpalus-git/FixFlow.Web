import { readDemoAccounts } from "@/features/auth/demoAccounts";

describe("readDemoAccounts", () => {
  it("returns only accounts with both email and password configured", () => {
    const accounts = readDemoAccounts({
      VITE_DEMO_DISPATCHER_EMAIL: "dispatcher@demo.test",
      VITE_DEMO_DISPATCHER_PASSWORD: "Demo-Password-1",
      VITE_DEMO_TECHNICIAN_EMAIL: "technician@demo.test",
      VITE_DEMO_TECHNICIAN_PASSWORD: "",
    });

    expect(accounts).toEqual([
      { role: "Dispatcher", email: "dispatcher@demo.test", password: "Demo-Password-1" },
    ]);
  });

  it("returns no accounts when nothing is configured", () => {
    expect(readDemoAccounts({})).toEqual([]);
  });
});
