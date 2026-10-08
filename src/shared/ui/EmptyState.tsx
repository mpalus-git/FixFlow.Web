import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 py-1 text-sm">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">{title}</p>
          {description ? <p className="text-muted-foreground">{description}</p> : null}
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <Icon aria-hidden="true" className="size-10 text-muted-foreground" />
      <h2 className="text-base font-medium">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
