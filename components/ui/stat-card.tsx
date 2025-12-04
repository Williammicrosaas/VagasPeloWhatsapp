import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "./glass-card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  className?: string
}

/**
 * StatCard - Card de estatística estilo Vision UI
 */
export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon,
  className 
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <GlassCard className={cn("hover:shadow-[0_0_20px_rgba(11,190,219,0.8)] transition-all", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-[#0BBEDB]/20">
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[#A0AEC0] text-sm mb-1">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {changeLabel && (
          <p className="text-[#A0AEC0] text-xs mt-2">{changeLabel}</p>
        )}
      </div>
    </GlassCard>
  )
}

