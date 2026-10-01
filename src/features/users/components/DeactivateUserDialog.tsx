import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import { useChangeUserStatusMutation } from "@/features/users/api/userMutations";
import { ApiError } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

type UserResponse = components["schemas"]["UserResponse"];

const openWorkOrdersCode = "User.HasOpenWorkOrders";

type DeactivationError = { kind: "openWorkOrders" } | { kind: "other"; message: string };

export type DeactivateUserDialogProps = {
  user: UserResponse | null;
  onClose: () => void;
};

export function DeactivateUserDialog({ user, onClose }: DeactivateUserDialogProps) {
  const { t } = useTranslation();
  const changeStatusMutation = useChangeUserStatusMutation();
  const [deactivationError, setDeactivationError] = useState<DeactivationError | null>(null);

  function close() {
    setDeactivationError(null);
    onClose();
  }

  function deactivate(userToDeactivate: UserResponse) {
    setDeactivationError(null);
    changeStatusMutation.mutate(
      { userId: userToDeactivate.id, isActive: false },
      {
        onSuccess: () => {
          toast.success(t("users.deactivate.deactivated", { email: userToDeactivate.email }));
          close();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.errorCode === openWorkOrdersCode) {
            setDeactivationError({ kind: "openWorkOrders" });
          } else {
            setDeactivationError({
              kind: "other",
              message:
                error instanceof ApiError ? describeApiError(error, t) : t("errors.unexpected"),
            });
          }
        },
      },
    );
  }

  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("users.deactivate.title", { email: user?.email })}</AlertDialogTitle>
          <AlertDialogDescription>{t("users.deactivate.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        {deactivationError === null ? null : (
          <Alert variant="destructive">
            <AlertDescription>
              {deactivationError.kind === "openWorkOrders" ? (
                <span>
                  {t("users.deactivate.openWorkOrders")}{" "}
                  <Link
                    to={`/work-orders?technician=${user?.id ?? ""}`}
                    className="font-medium underline underline-offset-4"
                  >
                    {t("users.deactivate.showWorkOrders")}
                  </Link>
                </span>
              ) : (
                deactivationError.message
              )}
            </AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={changeStatusMutation.isPending}
            onClick={() => {
              if (user !== null) {
                deactivate(user);
              }
            }}
          >
            {changeStatusMutation.isPending
              ? t("users.deactivate.pending")
              : t("users.deactivate.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
