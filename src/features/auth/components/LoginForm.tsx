import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/api/useLoginMutation";
import {
  loginFields,
  type LoginFormValues,
  loginSchema,
} from "@/features/auth/schemas/loginSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FieldError } from "@/shared/ui/FieldError";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export type LoginFormProps = {
  onLoggedIn: () => void;
};

export function LoginForm({ onLoggedIn }: LoginFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function showLoginError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.kind === "unauthorized") {
      setFormError(t("auth.login.invalidCredentials"));
    } else if (error.kind === "rateLimited") {
      setFormError(
        error.retryAfterSeconds === null
          ? t("auth.login.rateLimited")
          : t("auth.login.rateLimitedWithDelay", { seconds: error.retryAfterSeconds }),
      );
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(t(error.kind === "server" ? "errors.server" : "errors.network"), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (!applyFieldErrors(error, loginFields, form.setError)) {
      setFormError(error.detail ?? t("errors.unexpected"));
    }
  }

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
      onLoggedIn();
    } catch (error) {
      showLoginError(error);
    }
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">{t("auth.login.email")}</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          aria-invalid={errors.email !== undefined}
          aria-describedby="login-email-error"
          {...form.register("email")}
        />
        <FieldError id="login-email-error" message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">{t("auth.login.password")}</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password !== undefined}
          aria-describedby="login-password-error"
          {...form.register("password")}
        />
        <FieldError id="login-password-error" message={errors.password?.message} />
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
      </Button>
    </form>
  );
}
