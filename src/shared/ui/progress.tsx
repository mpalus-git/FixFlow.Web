import * as React from "react";
import { cn } from "cn";
import { Progress as ProgressPrimitive } from "radix-ui";

function Progress({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const value = props.value ?? 0;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${String(100 - value)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
