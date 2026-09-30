import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { startSession } from "@/shared/session/sessionStore";

type LoginRequest = components["schemas"]["LoginRequest"];

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) =>
      unwrap(await apiClient.POST("/api/v1/auth/login", { body: credentials })),
    onSuccess: (tokens) => {
      startSession(tokens);
    },
  });
}
