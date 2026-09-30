import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import "@/shared/i18n/i18n";
import { mockColorScheme } from "@/test/mockColorScheme";
import { server } from "@/test/server";

configure({ asyncUtilTimeout: 5_000 });
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
