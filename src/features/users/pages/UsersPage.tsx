import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchXIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import { useChangeUserStatusMutation } from "@/features/users/api/userMutations";
import { userListQueryOptions, usersPageSize } from "@/features/users/api/userQueries";
import { DeactivateUserDialog } from "@/features/users/components/DeactivateUserDialog";
import { UserFilters } from "@/features/users/components/UserFilters";
import { UsersTable } from "@/features/users/components/UsersTable";
import {
  hasActiveUserFilters,
  useUserListSearchParams,
} from "@/features/users/hooks/useUserListSearchParams";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { useKeepPageInRange } from "@/shared/lib/useKeepPageInRange";
import { useCurrentUser } from "@/shared/session/currentUser";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ListSkeleton } from "@/shared/ui/ListSkeleton";
import { PaginationControls } from "@/shared/ui/PaginationControls";

type UserResponse = components["schemas"]["UserResponse"];

export function UsersPage() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const { page, filters, setPage, setFilters, clearFilters } = useUserListSearchParams();
  const usersQuery = useQuery(userListQueryOptions({ page, filters }));
  const userPage = usersQuery.data;
  const isFiltered = hasActiveUserFilters({ page, filters });
  const changeStatusMutation = useChangeUserStatusMutation();
  const [userToDeactivate, setUserToDeactivate] = useState<UserResponse | null>(null);

  function activate(user: UserResponse) {
    changeStatusMutation.mutate(
      { userId: user.id, isActive: true },
      {
        onSuccess: () => {
          toast.success(t("users.activate.activated", { email: user.email }));
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? describeApiError(error, t) : t("errors.unexpected"),
          );
        },
      },
    );
  }
  useKeepPageInRange({
    page,
    pageSize: usersPageSize,
    totalCount: userPage?.totalCount,
    isPlaceholderData: usersQuery.isPlaceholderData,
    setPage,
  });

  function renderContent() {
    if (usersQuery.isError) {
      return <ErrorState onRetry={() => void usersQuery.refetch()} />;
    }
    if (userPage === undefined || currentUser === undefined) {
      return <ListSkeleton />;
    }
    if (userPage.totalCount === 0) {
      return isFiltered ? (
        <EmptyState
          icon={SearchXIcon}
          title={t("users.noResults.title")}
          description={t("users.noResults.description")}
        />
      ) : (
        <EmptyState
          icon={UsersIcon}
          title={t("users.empty.title")}
          description={t("users.empty.description")}
        />
      );
    }
    return (
      <>
        <UsersTable
          users={userPage.items}
          currentUserId={currentUser.id}
          isUpdating={usersQuery.isPlaceholderData}
          onDeactivate={setUserToDeactivate}
          onActivate={activate}
        />
        <PaginationControls
          page={page}
          pageSize={usersPageSize}
          totalCount={userPage.totalCount}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("users.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("users.description")}</p>
        </div>
        <Button asChild>
          <Link to="/users/new">
            <PlusIcon aria-hidden="true" />
            {t("users.create.link")}
          </Link>
        </Button>
      </div>
      <UserFilters
        filters={filters}
        onChange={setFilters}
        canClear={isFiltered}
        onClear={clearFilters}
      />
      {renderContent()}
      <DeactivateUserDialog
        user={userToDeactivate}
        onClose={() => {
          setUserToDeactivate(null);
        }}
      />
    </div>
  );
}
