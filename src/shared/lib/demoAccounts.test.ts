import { isDemoAccountEmail, readDemoAccounts } from "@/shared/lib/demoAccounts";

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

describe("isDemoAccountEmail", () => {
  const accounts = [
    { role: "Dispatcher", email: "dispatcher@demo.test", password: "Demo-Password-1" },
  ] as const;

  it("recognizes a demo account regardless of letter case", () => {
    expect(isDemoAccountEmail("Dispatcher@Demo.test", accounts)).toBe(true);
  });

  it("does not treat other accounts as demo accounts", () => {
    expect(isDemoAccountEmail("admin@fixflow.test", accounts)).toBe(false);
  });

  it("does not treat any account as a demo account when none are configured", () => {
    expect(isDemoAccountEmail("dispatcher@demo.test", [])).toBe(false);
  });
});
