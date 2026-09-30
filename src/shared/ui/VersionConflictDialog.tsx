import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export type VersionConflictDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
};

export function VersionConflictDialog({
  open,
  onOpenChange,
  onReload,
}: VersionConflictDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("versionConflict.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("versionConflict.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("versionConflict.keepEditing")}</AlertDialogCancel>
          <AlertDialogAction onClick={onReload}>{t("versionConflict.reload")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
