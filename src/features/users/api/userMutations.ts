import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/users/api/userQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";

type CreateUserRequest = components["schemas"]["CreateUserRequest"];

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserRequest) =>
      unwrap(await apiClient.POST("/api/v1/users", { body: request })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
