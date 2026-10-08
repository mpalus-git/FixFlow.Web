import type { ReactNode } from "react";
import { PageTitle } from "@/shared/ui/PageTitle";

export type PageHeaderProps = {
  title: string;
  subject?: string | undefined;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
};

export function PageHeader({ title, subject, description, actions, back }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {back}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <PageTitle title={title} subject={subject} />
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description === undefined ? null : (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions === undefined ? null : (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
