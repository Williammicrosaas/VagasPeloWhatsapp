import * as React from "react"
import { cn } from "@/lib/utils"

interface VisionTableProps extends React.HTMLAttributes<HTMLTableElement> {}

export function VisionTable({ className, ...props }: VisionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full text-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}

export function VisionTableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-white/10",
        className
      )}
      {...props}
    />
  )
}

export function VisionTableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "divide-y divide-white/5",
        className
      )}
      {...props}
    />
  )
}

export function VisionTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "hover:bg-white/5 transition-colors",
        className
      )}
      {...props}
    />
  )
}

export function VisionTableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "text-left py-3 px-4 text-sm font-medium text-[#A0AEC0]",
        className
      )}
      {...props}
    />
  )
}

export function VisionTableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "py-4 px-4 text-sm text-white",
        className
      )}
      {...props}
    />
  )
}

