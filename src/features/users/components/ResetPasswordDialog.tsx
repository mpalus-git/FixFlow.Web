import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useResetUserPasswordMutation } from "@/features/users/api/userMutations";
import {
  resetPasswordFields,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/features/users/schemas/resetPasswordSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import type { components } from "@/shared/api/schema";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { TextField } from "@/shared/ui/TextField";

type UserResponse = components["schemas"]["UserResponse"];

type ResetPasswordFormProps = {
  user: UserResponse;
  onDone: () => void;
};

function ResetPasswordForm({ user, onDone }: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const resetPasswordMutation = useResetUserPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function showError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setFormError(t("errors.unexpected"));
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, resetPasswordFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save({ newPassword }: ResetPasswordFormValues) {
    setFormError(null);
    try {
      await resetPasswordMutation.mutateAsync({ userId: user.id, newPassword });
      toast.success(t("users.resetPassword.done", { email: user.email }));
      onDone();
    } catch (error) {
      showError(error);
    }
  }

  const submit = form.handleSubmit(save);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{t("users.resetPassword.title", { email: user.email })}</DialogTitle>
        <DialogDescription>{t("users.resetPassword.description")}</DialogDescription>
      </DialogHeader>
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <TextField
        id="reset-new-password"
        type="password"
        autoComplete="new-password"
        label={t("users.resetPassword.newPassword")}
        hint={t("common.passwordRequirements")}
        error={errors.newPassword?.message}
        registration={form.register("newPassword")}
      />
      <TextField
        id="reset-confirm-new-password"
        type="password"
        autoComplete="new-password"
        label={t("users.resetPassword.confirmNewPassword")}
        error={errors.confirmNewPassword?.message}
        registration={form.register("confirmNewPassword")}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("users.resetPassword.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export type ResetPasswordDialogProps = {
  user: UserResponse | null;
  onClose: () => void;
};

export function ResetPasswordDialog({ user, onClose }: ResetPasswordDialogProps) {
  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        {user === null ? null : <ResetPasswordForm key={user.id} user={user} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
