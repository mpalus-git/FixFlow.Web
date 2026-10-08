import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/api/useLoginMutation";
import { DemoLoginButtons } from "@/features/auth/components/DemoLoginButtons";
import type { DemoAccount } from "@/shared/lib/demoAccounts";
import {
  loginFields,
  type LoginFormValues,
  loginSchema,
} from "@/features/auth/schemas/loginSchema";
import { ApiError, isServerUnreachable } from "@/shared/api/apiError";
import { describeApiError } from "@/shared/api/describeApiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FieldError } from "@/shared/ui/FieldError";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export type LoginFormProps = {
  onLoggedIn: () => void;
  demoAccounts?: readonly DemoAccount[];
};

export function LoginForm({ onLoggedIn, demoAccounts = [] }: LoginFormProps) {
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
    } else if (error.kind === "server" || isServerUnreachable(error)) {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (!applyFieldErrors(error, loginFields, form.setError)) {
      setFormError(error.detail ?? t("errors.unexpected"));
    }
  }

  async function logIn(values: LoginFormValues) {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
      onLoggedIn();
    } catch (error) {
      showLoginError(error);
    }
  }

  const submit = form.handleSubmit(logIn);
  const hasDemoAccounts = demoAccounts.length > 0;

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <DemoLoginButtons
        accounts={demoAccounts}
        disabled={loginMutation.isPending}
        onSelect={({ email, password }) => {
          form.reset({ email, password });
          void logIn({ email, password });
        }}
      />
      {hasDemoAccounts ? (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          {t("auth.login.orEmail")}
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
      ) : null}
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
      <Button
        type="submit"
        size="lg"
        variant={hasDemoAccounts ? "outline" : "default"}
        disabled={isSubmitting || loginMutation.isPending}
      >
        {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
      </Button>
    </form>
  );
}
