import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { buildLoginPath, loginPath } from "@/shared/lib/returnTo";
import { useSessionStore } from "@/shared/session/sessionStore";

export function useRedirectOnSessionEnd() {
  const status = useSessionStore((state) => state.status);
  const endReason = useSessionStore((state) => state.endReason);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (status === "anonymous") {
      queryClient.clear();
      const target =
        endReason === "signedOut" ? loginPath : buildLoginPath(`${pathname}${search}${hash}`);
      void navigate(target, { replace: true });
    }
  }, [status, endReason, queryClient, navigate, pathname, search, hash]);
}
