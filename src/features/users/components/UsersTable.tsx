import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserRowActions } from "@/features/users/components/UserRowActions";
import { userAccountProtection } from "@/features/users/userRules";
import type { components } from "@/shared/api/schema";
import { isRole } from "@/shared/session/currentUser";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/DataTable";

type UserResponse = components["schemas"]["UserResponse"];

const features = tableFeatures({});

const actionsColumnId = "actions";

function cellClassName(columnId: string): string {
  if (columnId === actionsColumnId) {
    return "sticky right-0 bg-background px-3";
  }
  if (columnId === "fullName") {
    return "min-w-40 px-3 whitespace-normal [overflow-wrap:anywhere]";
  }
  return "hidden px-3 md:table-cell";
}

type UserStatusBadgeProps = {
  isActive: boolean;
};

function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  const { t } = useTranslation();

  return isActive ? (
    <Badge
      variant="secondary"
      className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {t("users.status.active")}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      {t("users.status.inactive")}
    </Badge>
  );
}

const columnHelper = createColumnHelper<typeof features, UserResponse>();

export type UsersTableProps = {
  users: UserResponse[];
  currentUserId: string;
  isUpdating: boolean;
  onDeactivate: (user: UserResponse) => void;
  onActivate: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onChangeName: (user: UserResponse) => void;
};

export function UsersTable({
  users,
  currentUserId,
  isUpdating,
  onDeactivate,
  onActivate,
  onResetPassword,
  onChangeName,
}: UsersTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(() => {
    const roleLabel = (role: string) => (isRole(role) ? t(`roles.${role}`) : role);
    return columnHelper.columns([
      columnHelper.accessor("fullName", {
        id: "fullName",
        header: t("users.columns.fullName"),
        cell: ({ row }) => {
          const protection = userAccountProtection(row.original, currentUserId);
          return (
            <span className="flex flex-col">
              <span className="font-medium">{row.original.fullName}</span>
              <span className="text-muted-foreground">{row.original.email}</span>
              {protection === null ? null : (
                <span className="text-muted-foreground">
                  {t(protection === "ownAccount" ? "users.currentAccount" : "users.demoAccount")}
                </span>
              )}
              <span className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                {roleLabel(row.original.role)}
                <UserStatusBadge isActive={row.original.isActive} />
              </span>
            </span>
          );
        },
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: t("users.columns.role"),
        cell: (info) => roleLabel(info.getValue()),
      }),
      columnHelper.accessor("isActive", {
        id: "isActive",
        header: t("users.columns.status"),
        cell: (info) => <UserStatusBadge isActive={info.getValue()} />,
      }),
      columnHelper.display({
        id: actionsColumnId,
        header: () => <span className="sr-only">{t("users.columns.actions")}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <UserRowActions
              user={row.original}
              protection={userAccountProtection(row.original, currentUserId)}
              onDeactivate={onDeactivate}
              onActivate={onActivate}
              onResetPassword={onResetPassword}
              onChangeName={onChangeName}
            />
          </div>
        ),
      }),
    ]);
  }, [t, currentUserId, onDeactivate, onActivate, onResetPassword, onChangeName]);
  const table = useTable({
    features,
    columns,
    data: users,
    getRowId: (user) => user.id,
  });

  return <DataTable table={table} isUpdating={isUpdating} cellClassName={cellClassName} />;
}
