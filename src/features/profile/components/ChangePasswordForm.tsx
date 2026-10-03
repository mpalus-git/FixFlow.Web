import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/features/profile/api/useChangePasswordMutation";
import {
  changePasswordFields,
  type ChangePasswordFormValues,
  changePasswordSchema,
} from "@/features/profile/schemas/changePasswordSchema";
import { ApiError, isServerUnreachable } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/TextField";

export type ChangePasswordFormProps = {
  isDemoAccount: boolean;
};

export function ChangePasswordForm({ isDemoAccount }: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const changePasswordMutation = useChangePasswordMutation();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function showChangePasswordError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "rateLimited") {
      setFormError(
        error.retryAfterSeconds === null
          ? t("profile.password.rateLimited")
          : t("profile.password.rateLimitedWithDelay", { seconds: error.retryAfterSeconds }),
      );
    } else if (error.kind === "server" || isServerUnreachable(error)) {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (!applyFieldErrors(error, changePasswordFields, form.setError)) {
      setFormError(error.detail ?? t("errors.unexpected"));
    }
  }

  async function changePassword({ currentPassword, newPassword }: ChangePasswordFormValues) {
    setFormError(null);
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      form.reset();
      toast.success(t("profile.password.changed"));
    } catch (error) {
      showChangePasswordError(error);
    }
  }

  const submit = form.handleSubmit(changePassword);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      {isDemoAccount ? (
        <Alert role="note">
          <AlertDescription>{t("profile.password.demoAccountLocked")}</AlertDescription>
        </Alert>
      ) : null}
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <fieldset disabled={isDemoAccount} className="flex flex-col gap-4">
        <TextField
          id="current-password"
          label={t("profile.password.currentPassword")}
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          registration={form.register("currentPassword")}
        />
        <TextField
          id="new-password"
          label={t("profile.password.newPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          registration={form.register("newPassword")}
          hint={t("common.passwordRequirements")}
        />
        <TextField
          id="confirm-new-password"
          label={t("profile.password.confirmNewPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          registration={form.register("confirmNewPassword")}
        />
        <Button
          type="submit"
          className="self-start"
          disabled={isSubmitting || changePasswordMutation.isPending}
        >
          {isSubmitting ? t("profile.password.submitting") : t("profile.password.submit")}
        </Button>
      </fieldset>
    </form>
  );
}
