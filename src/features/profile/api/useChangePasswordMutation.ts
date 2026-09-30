import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { startSession } from "@/shared/session/sessionStore";

type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (request: ChangePasswordRequest) =>
      unwrap(await apiClient.POST("/api/v1/users/me/password", { body: request })),
    onSuccess: (tokens) => {
      startSession(tokens);
    },
  });
}
