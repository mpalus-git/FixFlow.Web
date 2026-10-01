import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { technicianOptionsQueryOptions } from "@/features/work-orders/api/technicianQueries";
import {
  type WorkOrderListFilters,
  workOrderStatuses,
} from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";

type TechnicianFilterProps = {
  technicianId: string | null;
  onChange: (technicianId: string | null) => void;
};

function TechnicianFilter({ technicianId, onChange }: TechnicianFilterProps) {
  const { t } = useTranslation();
  const id = useId();
  const techniciansQuery = useQuery(technicianOptionsQueryOptions());

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t("workOrders.filters.technician")}</Label>
      <NativeSelect
        id={id}
        className="w-full"
        value={technicianId ?? ""}
        disabled={techniciansQuery.data === undefined}
        onChange={(event) => {
          onChange(event.target.value === "" ? null : event.target.value);
        }}
      >
        <NativeSelectOption value="">
          {techniciansQuery.isError
            ? t("workOrders.filters.techniciansError")
            : techniciansQuery.data === undefined
              ? t("workOrders.filters.techniciansLoading")
              : t("workOrders.filters.allTechnicians")}
        </NativeSelectOption>
        {techniciansQuery.data?.map((technician) => (
          <NativeSelectOption key={technician.id} value={technician.id}>
            {technician.isActive
              ? technician.email
              : t("workOrders.filters.inactiveTechnician", { email: technician.email })}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

export type WorkOrderFiltersProps = {
  filters: WorkOrderListFilters;
  onChange: (filters: Partial<WorkOrderListFilters>) => void;
  showTechnicianFilter: boolean;
  canClear: boolean;
  onClear: () => void;
};

export function WorkOrderFilters({
  filters,
  onChange,
  showTechnicianFilter,
  canClear,
  onClear,
}: WorkOrderFiltersProps) {
  const { t } = useTranslation();
  const statusId = useId();
  const dueFromId = useId();
  const dueToId = useId();
  const overdueId = useId();

  return (
    <div
      role="group"
      aria-label={t("workOrders.filters.label")}
      className="flex flex-col gap-3 rounded-xl border p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={statusId}>{t("workOrders.filters.status")}</Label>
          <NativeSelect
            id={statusId}
            className="w-full"
            value={filters.status ?? ""}
            onChange={(event) => {
              onChange({
                status: workOrderStatuses.find((status) => status === event.target.value) ?? null,
              });
            }}
          >
            <NativeSelectOption value="">{t("workOrders.filters.allStatuses")}</NativeSelectOption>
            {workOrderStatuses.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {t(`workOrders.status.${status}`)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        {showTechnicianFilter ? (
          <TechnicianFilter
            technicianId={filters.technicianId}
            onChange={(technicianId) => {
              onChange({ technicianId });
            }}
          />
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor={dueFromId}>{t("workOrders.filters.dueFrom")}</Label>
          <Input
            id={dueFromId}
            type="date"
            value={filters.dueFrom ?? ""}
            onChange={(event) => {
              const dueFrom = event.target.value === "" ? null : event.target.value;
              const isRangeReversed =
                dueFrom !== null && filters.dueTo !== null && filters.dueTo < dueFrom;
              onChange(isRangeReversed ? { dueFrom, dueTo: null } : { dueFrom });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={dueToId}>{t("workOrders.filters.dueTo")}</Label>
          <Input
            id={dueToId}
            type="date"
            min={filters.dueFrom ?? undefined}
            value={filters.dueTo ?? ""}
            onChange={(event) => {
              onChange({ dueTo: event.target.value === "" ? null : event.target.value });
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            id={overdueId}
            type="checkbox"
            className="size-4 accent-primary"
            checked={filters.overdueOnly}
            onChange={(event) => {
              onChange({ overdueOnly: event.target.checked });
            }}
          />
          <Label htmlFor={overdueId}>{t("workOrders.filters.overdueOnly")}</Label>
        </div>
        {canClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <XIcon aria-hidden="true" />
            {t("workOrders.filters.clear")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
