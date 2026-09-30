import { act, renderHook } from "@testing-library/react";
import type { ServerReadyCheck } from "@/app/server-wake/checkServerReady";
import { useServerWake } from "@/app/server-wake/useServerWake";

function readyAfterAttempts(failedAttempts: number) {
  let attempts = 0;
  const checkReady = vi.fn<ServerReadyCheck>(() => {
    attempts += 1;
    return Promise.resolve(attempts > failedAttempts);
  });
  return checkReady;
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("useServerWake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("becomes ready without the waking screen when the server answers at once", async () => {
    const { result } = renderHook(() => useServerWake(readyAfterAttempts(0)));

    await advance(0);

    expect(result.current.status).toBe("ready");
  });

  it("switches to waking when the first answer takes longer than 3 seconds", async () => {
    const checkReady = vi.fn<ServerReadyCheck>(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 10_000);
        }),
    );
    const { result } = renderHook(() => useServerWake(checkReady));

    await advance(2_900);
    expect(result.current.status).toBe("checking");

    await advance(200);
    expect(result.current.status).toBe("waking");

    await advance(7_000);
    expect(result.current.status).toBe("ready");
  });

  it("checks again every 3 seconds until the server is ready", async () => {
    const checkReady = readyAfterAttempts(4);
    const { result } = renderHook(() => useServerWake(checkReady));

    await advance(9_000);
    expect(checkReady).toHaveBeenCalledTimes(4);
    expect(result.current.status).toBe("waking");

    await advance(3_000);
    expect(checkReady).toHaveBeenCalledTimes(5);
    expect(result.current.status).toBe("ready");
  });

  it("reports the elapsed time for the progress bar", async () => {
    const { result } = renderHook(() => useServerWake(readyAfterAttempts(100)));

    await advance(6_000);

    expect(result.current.elapsedMs).toBe(6_000);
  });

  it("gives up after 90 seconds and starts over on retry", async () => {
    const checkReady = readyAfterAttempts(31);
    const { result } = renderHook(() => useServerWake(checkReady));

    await advance(90_000);
    expect(result.current.status).toBe("unavailable");
    const attemptsBeforeRetry = checkReady.mock.calls.length;

    act(() => {
      result.current.retry();
    });
    expect(result.current.status).toBe("waking");
    await advance(0);

    expect(checkReady.mock.calls.length).toBe(attemptsBeforeRetry + 1);
    expect(result.current.status).toBe("ready");
  });
});
