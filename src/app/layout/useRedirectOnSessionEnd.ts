import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { buildLoginPath } from "@/shared/lib/returnTo";
import { useSessionStore } from "@/shared/session/sessionStore";

export function useRedirectOnSessionEnd() {
  const status = useSessionStore((state) => state.status);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (status === "anonymous") {
      queryClient.clear();
      void navigate(buildLoginPath(`${pathname}${search}${hash}`), { replace: true });
    }
  }, [status, queryClient, navigate, pathname, search, hash]);
}
