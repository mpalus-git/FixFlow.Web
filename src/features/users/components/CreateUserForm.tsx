import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  createUserFields,
  type CreateUserFormInput,
  type CreateUserFormValues,
  createUserSchema,
  emptyCreateUserFormValues,
} from "@/features/users/schemas/createUserSchema";
import { ApiError } from "@/shared/api/apiError";
import { applyFieldErrors } from "@/shared/api/applyFieldErrors";
import { describeApiError } from "@/shared/api/describeApiError";
import { roles } from "@/shared/session/currentUser";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FieldError } from "@/shared/ui/FieldError";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { TextField } from "@/shared/ui/TextField";

const duplicateEmailCode = "User.DuplicateEmail";

export type CreateUserFormProps = {
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
};

export function CreateUserForm({ onSubmit }: CreateUserFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: emptyCreateUserFormValues,
  });
  const { errors, isSubmitting } = form.formState;

  function showSaveError(error: unknown) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    if (error.errorCode === duplicateEmailCode) {
      form.setError("email", { type: "server", message: describeApiError(error, t) });
    } else if (error.kind === "server" || error.kind === "network") {
      toast.error(describeApiError(error, t), {
        action: { label: t("states.retry"), onClick: () => void submit() },
      });
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, createUserFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save(values: CreateUserFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      showSaveError(error);
    }
  }

  const submit = form.handleSubmit(save);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="user-full-name"
          autoComplete="off"
          label={t("users.columns.fullName")}
          error={errors.fullName?.message}
          registration={form.register("fullName")}
        />
        <TextField
          id="user-email"
          type="email"
          inputMode="email"
          label={t("users.columns.email")}
          error={errors.email?.message}
          registration={form.register("email")}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-role">{t("users.columns.role")}</Label>
          <NativeSelect
            id="user-role"
            className="w-full"
            aria-invalid={errors.role !== undefined}
            aria-describedby="user-role-error"
            {...form.register("role")}
          >
            <NativeSelectOption value="">{t("users.create.chooseRole")}</NativeSelectOption>
            {roles.map((role) => (
              <NativeSelectOption key={role} value={role}>
                {t(`roles.${role}`)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError id="user-role-error" message={errors.role?.message} />
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <TextField
            id="user-password"
            type="password"
            autoComplete="new-password"
            label={t("users.create.password")}
            hint={t("common.passwordRequirements")}
            error={errors.password?.message}
            registration={form.register("password")}
          />
          <TextField
            id="user-confirm-password"
            type="password"
            autoComplete="new-password"
            label={t("users.create.confirmPassword")}
            error={errors.confirmPassword?.message}
            registration={form.register("confirmPassword")}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("users.create.submit")}
        </Button>
        <Button variant="outline" asChild>
          <Link to="/users">{t("common.cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}
