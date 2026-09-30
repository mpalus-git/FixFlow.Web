import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/features/profile/api/useChangePasswordMutation";
import {
  changePasswordFields,
  type ChangePasswordFormValues,
  changePasswordSchema,
} from "@/features/profile/schemas/changePasswordSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FieldError } from "@/shared/ui/FieldError";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  error: string | undefined;
  registration: UseFormRegisterReturn;
  hint?: string;
};

function PasswordField({ id, label, autoComplete, error, registration, hint }: PasswordFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        autoComplete={autoComplete}
        aria-invalid={error !== undefined}
        aria-describedby={hint === undefined ? errorId : `${hintId} ${errorId}`}
        {...registration}
      />
      {hint === undefined ? null : (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

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
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(t(error.kind === "server" ? "errors.server" : "errors.network"), {
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
        <PasswordField
          id="current-password"
          label={t("profile.password.currentPassword")}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          registration={form.register("currentPassword")}
        />
        <PasswordField
          id="new-password"
          label={t("profile.password.newPassword")}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          registration={form.register("newPassword")}
          hint={t("profile.password.requirements")}
        />
        <PasswordField
          id="confirm-new-password"
          label={t("profile.password.confirmNewPassword")}
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
