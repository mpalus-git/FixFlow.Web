import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

export type SortableHeaderProps = {
  label: string;
  sorted: false | "asc" | "desc";
  onToggle: () => void;
};

const sortIcons = {
  asc: ArrowUpIcon,
  desc: ArrowDownIcon,
  none: ChevronsUpDownIcon,
};

export function SortableHeader({ label, sorted, onToggle }: SortableHeaderProps) {
  const Icon = sortIcons[sorted === false ? "none" : sorted];

  return (
    <Button variant="ghost" size="sm" className="-ml-2.5 font-medium" onClick={onToggle}>
      {label}
      <Icon aria-hidden="true" className={sorted === false ? "text-muted-foreground" : undefined} />
    </Button>
  );
}
