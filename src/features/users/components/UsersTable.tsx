import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { components } from "@/shared/api/schema";
import { isRole } from "@/shared/session/currentUser";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/DataTable";

type UserResponse = components["schemas"]["UserResponse"];

const features = tableFeatures({});

function cellClassName(columnId: string): string {
  return columnId === "email" ? "min-w-40 px-3 whitespace-normal break-all" : "px-3";
}

const columnHelper = createColumnHelper<typeof features, UserResponse>();

export type UsersTableProps = {
  users: UserResponse[];
  currentUserId: string;
  isUpdating: boolean;
};

export function UsersTable({ users, currentUserId, isUpdating }: UsersTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("email", {
          id: "email",
          header: t("users.columns.email"),
          cell: ({ row }) => (
            <span className="flex flex-col">
              <span className="font-medium">{row.original.email}</span>
              {row.original.id === currentUserId ? (
                <span className="text-muted-foreground">{t("users.currentAccount")}</span>
              ) : null}
            </span>
          ),
        }),
        columnHelper.accessor("role", {
          id: "role",
          header: t("users.columns.role"),
          cell: (info) => {
            const role = info.getValue();
            return isRole(role) ? t(`roles.${role}`) : role;
          },
        }),
        columnHelper.accessor("isActive", {
          id: "isActive",
          header: t("users.columns.status"),
          cell: (info) =>
            info.getValue() ? (
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
            ),
        }),
      ]),
    [t, currentUserId],
  );
  const table = useTable({
    features,
    columns,
    data: users,
    getRowId: (user) => user.id,
  });

  return <DataTable table={table} isUpdating={isUpdating} cellClassName={cellClassName} />;
}
