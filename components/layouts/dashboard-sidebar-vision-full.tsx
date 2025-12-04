"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  User,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSidebarVisionFull() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => pathname === path

  const mainMenuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/jobs", icon: Briefcase, label: "Vagas" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  ]

  const accountMenuItems = [
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#0B1437] border-r border-white/10 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(11,190,219,0.6)]">
                V
              </div>
              <span className="text-white font-bold text-lg">VISION UI</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(11,190,219,0.6)] mx-auto">
              V
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    active
                      ? "bg-[#0BBEDB]/20 text-[#0BBEDB] border border-[#0BBEDB]/30 shadow-[0_0_10px_rgba(11,190,219,0.4)]"
                      : "text-[#A0AEC0] hover:text-white hover:bg-[#111C44]/50",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10"></div>

          {/* Account Pages */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider mb-2">
                Account Pages
              </p>
            )}
            {accountMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-[#0BBEDB]/20 text-[#0BBEDB] border border-[#0BBEDB]/30 shadow-[0_0_10px_rgba(11,190,219,0.4)]"
                      : "text-[#A0AEC0] hover:text-white hover:bg-[#111C44]/50",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-white/10">
          {!collapsed ? (
            <div className="bg-gradient-to-r from-[#0BBEDB]/10 to-[#7F5CFF]/10 border border-[#0BBEDB]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#0BBEDB] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">Need help?</p>
                  <p className="text-[#A0AEC0] text-xs mb-3">Please check our docs</p>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0BBEDB] text-black text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
                  >
                    DOCUMENTATION
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <HelpCircle className="w-5 h-5 text-[#A0AEC0]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

