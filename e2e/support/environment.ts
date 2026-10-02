export const appUrl = "http://localhost:4173";

export const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8080";

export type DemoRole = "admin" | "dispatcher" | "technician";

export type DemoAccount = {
  email: string;
  password: string;
};

export function demoAccount(role: DemoRole): DemoAccount {
  const variable = `DEMO_${role.toUpperCase()}_PASSWORD`;
  const password = process.env[variable];
  if (!password) {
    throw new Error(`${variable} is not set. Copy e2e/.env.example to e2e/.env and fill it in.`);
  }
  return { email: `${role}@fixflow.local`, password };
}
