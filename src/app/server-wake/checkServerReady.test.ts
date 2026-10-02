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
