import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-surface-tertiary rounded-control animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
