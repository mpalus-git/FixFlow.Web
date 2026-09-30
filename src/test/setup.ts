import "@testing-library/jest-dom/vitest";
import "@/shared/i18n/i18n";
import { mockColorScheme } from "@/test/mockColorScheme";
import { server } from "@/test/server";

mockColorScheme(false);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  mockColorScheme(false);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
