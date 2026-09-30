import { useTranslation } from "react-i18next";
import { isValidationMessageKey } from "@/shared/lib/validation";

export type FieldErrorProps = {
  id: string;
  message: string | undefined;
};

export function FieldError({ id, message }: FieldErrorProps) {
  const { t } = useTranslation();

  if (message === undefined || message === "") {
    return null;
  }

  return (
    <p id={id} className="text-sm text-destructive">
      {isValidationMessageKey(message) ? t(message) : message}
    </p>
  );
}
