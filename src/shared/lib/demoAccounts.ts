type DemoRole = "Dispatcher" | "Technician";

export type DemoAccount = {
  role: DemoRole;
  email: string;
  password: string;
};

type DemoAccountEnv = Pick<
  ImportMetaEnv,
  | "VITE_DEMO_DISPATCHER_EMAIL"
  | "VITE_DEMO_DISPATCHER_PASSWORD"
  | "VITE_DEMO_TECHNICIAN_EMAIL"
  | "VITE_DEMO_TECHNICIAN_PASSWORD"
>;

export const demoDataResetUtc = "02:00:00Z";

export function readDemoAccounts(env: DemoAccountEnv = import.meta.env): DemoAccount[] {
  const candidates = [
    {
      role: "Dispatcher",
      email: env.VITE_DEMO_DISPATCHER_EMAIL,
      password: env.VITE_DEMO_DISPATCHER_PASSWORD,
    },
    {
      role: "Technician",
      email: env.VITE_DEMO_TECHNICIAN_EMAIL,
      password: env.VITE_DEMO_TECHNICIAN_PASSWORD,
    },
  ] as const;
  return candidates.flatMap(({ role, email, password }) =>
    email && password ? [{ role, email, password }] : [],
  );
}

export function isDemoAccountEmail(
  email: string,
  accounts: readonly DemoAccount[] = readDemoAccounts(),
): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return accounts.some((account) => account.email.trim().toLowerCase() === normalizedEmail);
}
