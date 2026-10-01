import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "@/shared/ui/FieldError";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export type TextFieldProps = {
  id: string;
  label: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
  type?: HTMLInputTypeAttribute;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  inputMode?: "text" | "tel" | "email" | "numeric";
  min?: string;
  max?: string;
  hint?: string;
};

export function TextField({
  id,
  label,
  error,
  registration,
  type = "text",
  autoComplete = "off",
  inputMode,
  min,
  max,
  hint,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
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
