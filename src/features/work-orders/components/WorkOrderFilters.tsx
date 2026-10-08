import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { technicianOptionsQueryOptions } from "@/shared/api/technicianQueries";
import type { WorkOrderListFilters } from "@/features/work-orders/hooks/useWorkOrderListSearchParams";
import {
  openWorkOrderStatuses,
  orderedStatuses,
  type WorkOrderStatus,
  workOrderStatuses,
} from "@/features/work-orders/workOrderRules";
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
              ? technician.fullName
              : t("workOrders.filters.inactiveTechnician", { name: technician.fullName })}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

type StatusFilterProps = {
  statuses: readonly WorkOrderStatus[];
  onChange: (statuses: WorkOrderStatus[]) => void;
};

function StatusFilter({ statuses, onChange }: StatusFilterProps) {
  const { t } = useTranslation();
  const id = useId();
  const isOpenOnly =
    statuses.length === openWorkOrderStatuses.length &&
    openWorkOrderStatuses.every((status) => statuses.includes(status));

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm leading-none font-medium">
        {t("workOrders.filters.status")}
      </legend>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {workOrderStatuses.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <input
              id={`${id}-${status}`}
              type="checkbox"
              className="size-4 accent-primary"
              checked={statuses.includes(status)}
              onChange={(event) => {
                onChange(
                  orderedStatuses(
                    event.target.checked
                      ? [...statuses, status]
                      : statuses.filter((chosen) => chosen !== status),
                  ),
                );
              }}
            />
            <Label htmlFor={`${id}-${status}`} className="font-normal">
              {t(`workOrders.status.${status}`)}
            </Label>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          aria-pressed={isOpenOnly}
          className="aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
          onClick={() => {
            onChange(isOpenOnly ? [] : [...openWorkOrderStatuses]);
          }}
        >
          {t("workOrders.filters.openOnly")}
        </Button>
      </div>
    </fieldset>
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
  const dueFromId = useId();
  const dueToId = useId();
  const overdueId = useId();

  return (
    <div role="group" aria-label={t("workOrders.filters.label")} className="flex flex-col gap-3">
      <StatusFilter
        statuses={filters.status}
        onChange={(status) => {
          onChange({ status });
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
