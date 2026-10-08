import { useCallback, useEffect, useState } from "react";
import { checkServerReady, type ServerReadyCheck } from "@/app/server-wake/checkServerReady";

export type ServerWakeStatus = "checking" | "waking" | "ready" | "unavailable";

const serverWakeTimings = {
  slowResponseMs: 3_000,
  retryIntervalMs: 3_000,
  giveUpAfterMs: 90_000,
  progressIntervalMs: 500,
};

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

async function waitUntilReady(
  checkReady: ServerReadyCheck,
  signal: AbortSignal,
  startedAt: number,
): Promise<boolean> {
  const { retryIntervalMs, giveUpAfterMs } = serverWakeTimings;
  while (!signal.aborted) {
    const attemptStartedAt = Date.now();
    const attemptSignal = AbortSignal.any([signal, AbortSignal.timeout(retryIntervalMs)]);
    if (await checkReady(attemptSignal)) {
      return true;
    }
    const now = Date.now();
    if (now - startedAt >= giveUpAfterMs) {
      return false;
    }
    await sleep(Math.max(0, attemptStartedAt + retryIntervalMs - now), signal);
  }
  return false;
}

export function useServerWake(checkReady: ServerReadyCheck = checkServerReady) {
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState<ServerWakeStatus>("checking");
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const slowTimer = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "waking" : current));
    }, serverWakeTimings.slowResponseMs);
    const progressTimer = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, serverWakeTimings.progressIntervalMs);
    const stopTimers = () => {
      clearTimeout(slowTimer);
      clearInterval(progressTimer);
    };

    void waitUntilReady(checkReady, controller.signal, startedAt).then((isReady) => {
      if (!controller.signal.aborted) {
        stopTimers();
        setStatus(isReady ? "ready" : "unavailable");
      }
    });

    return () => {
      controller.abort();
      stopTimers();
    };
  }, [run, checkReady]);

  const retry = useCallback(() => {
    setStatus("waking");
    setElapsedMs(0);
    setRun((current) => current + 1);
  }, []);

  return { status, elapsedMs, retry };
}
