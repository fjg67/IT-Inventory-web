import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--green-primary)] text-white shadow-green hover:bg-[#187737] active:scale-[0.98]",
        primary:
          "border-transparent bg-[var(--green-primary)] text-white shadow-green hover:bg-[#187737] active:scale-[0.98]",
        destructive:
          "border-[var(--danger-border)] bg-[var(--danger-subtle)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.18)] active:scale-[0.98]",
        danger:
          "border-[var(--danger-border)] bg-[var(--danger-subtle)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.18)] active:scale-[0.98]",
        outline:
          "border-[var(--border-card)] bg-transparent text-[var(--text-primary)] hover:bg-bg-elevated hover:border-[var(--border-accent)]",
        secondary:
          "border-[var(--border-card)] bg-bg-elevated text-[var(--text-primary)] hover:bg-bg-hover",
        ghost:
          "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-bg-elevated hover:text-[var(--text-primary)]",
        link:
          "border-transparent p-0 text-brand-light underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
