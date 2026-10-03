import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useChangeUserNameMutation } from "@/features/users/api/userMutations";
import {
  userNameFields,
  type UserNameFormValues,
  userNameSchema,
} from "@/features/users/schemas/userNameSchema";
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

type ChangeUserNameFormProps = {
  user: UserResponse;
  onDone: () => void;
};

function ChangeUserNameForm({ user, onDone }: ChangeUserNameFormProps) {
  const { t } = useTranslation();
  const changeUserNameMutation = useChangeUserNameMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<UserNameFormValues>({
    resolver: zodResolver(userNameSchema),
    defaultValues: { fullName: user.fullName },
  });
  const { errors, isSubmitting } = form.formState;

  function showError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setFormError(t("errors.unexpected"));
    } else if (
      error.kind !== "validation" ||
      !applyFieldErrors(error, userNameFields, form.setError)
    ) {
      setFormError(describeApiError(error, t));
    }
  }

  async function save({ fullName }: UserNameFormValues) {
    setFormError(null);
    try {
      const updated = await changeUserNameMutation.mutateAsync({ userId: user.id, fullName });
      toast.success(t("users.changeName.done", { email: updated.email }));
      onDone();
    } catch (error) {
      showError(error);
    }
  }

  const submit = form.handleSubmit(save);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{t("users.changeName.title", { email: user.email })}</DialogTitle>
        <DialogDescription>{t("users.changeName.description")}</DialogDescription>
      </DialogHeader>
      {formError === null ? null : (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <TextField
        id="change-user-full-name"
        label={t("users.columns.fullName")}
        error={errors.fullName?.message}
        registration={form.register("fullName")}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("users.changeName.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export type ChangeUserNameDialogProps = {
  user: UserResponse | null;
  onClose: () => void;
};

export function ChangeUserNameDialog({ user, onClose }: ChangeUserNameDialogProps) {
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
        {user === null ? null : <ChangeUserNameForm key={user.id} user={user} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
