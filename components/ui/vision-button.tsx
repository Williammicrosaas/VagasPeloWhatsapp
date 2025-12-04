import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[#0BBEDB] text-black shadow-[0_0_15px_rgba(11,190,219,0.6)] hover:opacity-80 hover:shadow-[0_0_20px_rgba(11,190,219,0.8)]",
        secondary: "bg-[#111C44] text-white border border-white/10 hover:bg-[#111C44]/80",
        ghost: "bg-transparent text-white hover:bg-white/10",
        outline: "border border-[#0BBEDB] text-[#0BBEDB] hover:bg-[#0BBEDB]/10",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        default: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface VisionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const VisionButton = React.forwardRef<HTMLButtonElement, VisionButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
VisionButton.displayName = "VisionButton"

export { VisionButton, buttonVariants }

