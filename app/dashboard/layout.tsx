import { DashboardSidebarVisionFull } from "@/components/layouts/dashboard-sidebar-vision-full"
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar"
import type React from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1437]">
      <DashboardSidebarVisionFull />
      <div className="lg:ml-64">
        <DashboardNavbar />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
