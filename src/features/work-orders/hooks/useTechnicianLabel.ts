import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { technicianOptionsQueryOptions } from "@/shared/api/technicianQueries";
import { useCurrentUser } from "@/shared/session/currentUser";

export function useTechnicianLabel(): (technicianId: string | null) => string {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const canListTechnicians = user !== undefined && user.role !== "Technician";
  const techniciansQuery = useQuery({
    ...technicianOptionsQueryOptions(),
    enabled: canListTechnicians,
  });

  return (technicianId) => {
    if (technicianId === null) {
      return t("workOrders.unassigned");
    }
    if (technicianId === user?.id) {
      return user.email;
    }
    return (
      techniciansQuery.data?.find((technician) => technician.id === technicianId)?.email ??
      t("workOrders.details.unknownTechnician")
    );
  };
}
