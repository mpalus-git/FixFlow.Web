import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import "@/shared/i18n/i18n";
import { mockColorScheme } from "@/test/mockColorScheme";
import { server } from "@/test/server";

configure({ asyncUtilTimeout: 10_000 });
window.scrollTo = () => undefined;
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
