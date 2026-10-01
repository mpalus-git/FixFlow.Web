import { XIcon } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { UserListFilters } from "@/features/users/api/userQueries";
import { isRole, roles } from "@/shared/session/currentUser";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";

export type UserFiltersProps = {
  filters: UserListFilters;
  onChange: (filters: Partial<UserListFilters>) => void;
  canClear: boolean;
  onClear: () => void;
};

export function UserFilters({ filters, onChange, canClear, onClear }: UserFiltersProps) {
  const { t } = useTranslation();
  const roleId = useId();
  const statusId = useId();
  const statusValue = filters.isActive === null ? "" : String(filters.isActive);

  return (
    <div
      role="group"
      aria-label={t("users.filters.label")}
      className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-col gap-2 sm:w-56">
        <Label htmlFor={roleId}>{t("users.filters.role")}</Label>
        <NativeSelect
          id={roleId}
          className="w-full"
          value={filters.role ?? ""}
          onChange={(event) => {
            const { value } = event.target;
            onChange({ role: isRole(value) ? value : null });
          }}
        >
          <NativeSelectOption value="">{t("users.filters.allRoles")}</NativeSelectOption>
          {roles.map((role) => (
            <NativeSelectOption key={role} value={role}>
              {t(`roles.${role}`)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2 sm:w-56">
        <Label htmlFor={statusId}>{t("users.filters.status")}</Label>
        <NativeSelect
          id={statusId}
          className="w-full"
          value={statusValue}
          onChange={(event) => {
            const { value } = event.target;
            onChange({ isActive: value === "" ? null : value === "true" });
          }}
        >
          <NativeSelectOption value="">{t("users.filters.allStatuses")}</NativeSelectOption>
          <NativeSelectOption value="true">{t("users.status.active")}</NativeSelectOption>
          <NativeSelectOption value="false">{t("users.status.inactive")}</NativeSelectOption>
        </NativeSelect>
      </div>
      {canClear ? (
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={onClear}>
          <XIcon aria-hidden="true" />
          {t("users.filters.clear")}
        </Button>
      ) : null}
    </div>
  );
}
