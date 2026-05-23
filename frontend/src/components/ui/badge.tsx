import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary",
        success:
          "border-transparent bg-success/15 text-success",
        warning:
          "border-transparent bg-warning/15 text-warning",
        danger:
          "border-transparent bg-danger/15 text-danger",
        info:
          "border-transparent bg-info/15 text-info",
        outline:
          "border-border text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?: string
  bgSubtle?: string
  borderColor?: string
  icon?: React.ReactNode
}

function Badge({ className, variant, color, bgSubtle, borderColor, icon, children, style, ...props }: BadgeProps) {
  const customStyle = color || bgSubtle || borderColor
    ? {
        color: color,
        background: bgSubtle,
        borderColor: borderColor,
        ...(style || {}),
      }
    : style

  return (
    <div className={cn(badgeVariants({ variant }), customStyle ? 'border' : '', className)} style={customStyle} {...props}>
      {icon && <span className="text-[10px]">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
