import * as React from "react"
import { cn } from "@/lib/utils"

export interface VisionInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const VisionInput = React.forwardRef<HTMLInputElement, VisionInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full bg-[#0B1437] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-[#A0AEC0]",
          "focus:outline-none focus:ring-2 focus:ring-[#0BBEDB] focus:border-transparent",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
VisionInput.displayName = "VisionInput"

export { VisionInput }
