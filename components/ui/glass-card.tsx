import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * GlassCard - Card estilo glassmorphism do Vision UI
 */
export function GlassCard({ 
  children, 
  className,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-[#111C44]/70 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(11,190,219,0.6)] p-5 border border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

