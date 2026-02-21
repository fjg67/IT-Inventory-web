import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-surface via-surface-elevated to-surface bg-[length:200%_100%] skeleton",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
