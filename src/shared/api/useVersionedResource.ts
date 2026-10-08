import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Versioned } from "@/shared/api/baseClient";
import type { VersionConflictDialogProps } from "@/shared/ui/VersionConflictDialog";

export function useVersionedResource<TData, TQueryKey extends QueryKey>(
  options: UseQueryOptions<Versioned<TData>, Error, Versioned<TData>, TQueryKey>,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const query = useQuery(options);
  const [loadedVersion, setLoadedVersion] = useState(query.data);
  const [isConflictOpen, setIsConflictOpen] = useState(false);

  if (loadedVersion === undefined && query.data !== undefined) {
    setLoadedVersion(query.data);
  }

  async function loadCurrentVersion() {
    try {
      setLoadedVersion(await queryClient.query({ ...options, staleTime: 0 }));
    } catch {
      toast.error(t("states.errorTitle"));
    }
  }

  const conflictDialogProps: VersionConflictDialogProps = {
    open: isConflictOpen,
    onOpenChange: setIsConflictOpen,
    onReload: () => void loadCurrentVersion(),
  };

  return {
    query,
    editedVersion: loadedVersion,
    conflictDialogProps,
    openConflict: () => {
      setIsConflictOpen(true);
    },
  };
}
