import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/users/api/userQueries";
import { apiClient } from "@/shared/api/apiClient";
import { unwrap } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { sessionQueryKeys } from "@/shared/session/currentUser";

type CreateUserRequest = components["schemas"]["CreateUserRequest"];
type UserResponse = components["schemas"]["UserResponse"];
type UserPage = components["schemas"]["PagedResponseOfUserResponse"];

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserRequest) =>
      unwrap(await apiClient.POST("/api/v1/users", { body: request })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export type UserStatusChange = {
  userId: string;
  isActive: boolean;
};

export function useChangeUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: UserStatusChange) => {
      const options = { params: { path: { userId } } };
      await (isActive
        ? apiClient.POST("/api/v1/users/{userId}/activate", options)
        : apiClient.POST("/api/v1/users/{userId}/deactivate", options));
    },
    onSuccess: async (_, { userId, isActive }) => {
      queryClient.setQueriesData<UserPage>({ queryKey: userKeys.lists() }, (userPage) =>
        userPage === undefined
          ? userPage
          : {
              ...userPage,
              items: userPage.items.map((user) =>
                user.id === userId ? { ...user, isActive } : user,
              ),
            },
      );
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export type UserPasswordReset = {
  userId: string;
  newPassword: string;
};

export function useResetUserPasswordMutation() {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: UserPasswordReset) => {
      await apiClient.POST("/api/v1/users/{userId}/password", {
        params: { path: { userId } },
        body: { newPassword },
      });
    },
  });
}

export type UserNameChange = {
  userId: string;
  fullName: string;
};

export function useChangeUserNameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, fullName }: UserNameChange) =>
      unwrap(
        await apiClient.PUT("/api/v1/users/{userId}", {
          params: { path: { userId } },
          body: { fullName },
        }),
      ),
    onSuccess: async (updated: UserResponse) => {
      queryClient.setQueriesData<UserPage>({ queryKey: userKeys.lists() }, (userPage) =>
        userPage === undefined
          ? userPage
          : {
              ...userPage,
              items: userPage.items.map((user) => (user.id === updated.id ? updated : user)),
            },
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: sessionQueryKeys.currentUser }),
      ]);
    },
  });
}
