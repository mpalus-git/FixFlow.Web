import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <Icon aria-hidden="true" className="size-10 text-muted-foreground" />
      <h2 className="text-base font-medium">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
