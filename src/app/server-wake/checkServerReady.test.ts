import { http, HttpResponse } from "msw";
import { checkServerReady } from "@/app/server-wake/checkServerReady";
import { apiBaseUrl } from "@/shared/api/baseClient";
import { server } from "@/test/server";

const readinessUrl = `${apiBaseUrl}/api/v1/system/ready`;

describe("checkServerReady", () => {
  it("reports ready when the readiness check succeeds", async () => {
    server.use(http.get(readinessUrl, () => HttpResponse.text("Healthy")));

    expect(await checkServerReady(new AbortController().signal)).toBe(true);
  });

  it("reads the whole response so the request finishes before the result is reported", async () => {
    const response = new Response("Healthy");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    expect(await checkServerReady(new AbortController().signal)).toBe(true);
    expect(response.bodyUsed).toBe(true);

    fetchSpy.mockRestore();
  });

  it("reports not ready while the sleeping server shows a loading page", async () => {
    server.use(
      http.get(readinessUrl, () =>
        HttpResponse.html("<html>Application loading</html>", { status: 503 }),
      ),
    );

    expect(await checkServerReady(new AbortController().signal)).toBe(false);
  });

  it("reports not ready when the server cannot be reached", async () => {
    server.use(http.get(readinessUrl, () => HttpResponse.error()));

    expect(await checkServerReady(new AbortController().signal)).toBe(false);
  });
});
