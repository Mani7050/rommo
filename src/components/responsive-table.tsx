import * as React from "react"
import { useState } from "react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

interface ResponsiveTableProps<T> {
  data: T[]
  renderMobileHeader: (item: T) => React.ReactNode
  renderMobileDetails: (item: T) => React.ReactNode
  desktopTable: React.ReactNode
}

export function ResponsiveTable<T>({
  data,
  renderMobileHeader,
  renderMobileDetails,
  desktopTable
}: ResponsiveTableProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Record<string | number, boolean>>({})

  const toggleExpand = (id: string | number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="w-full">
      {/* Desktop Layout - Shows the standard table */}
      <div className="hidden md:block w-full">
        {desktopTable}
      </div>

      {/* Mobile Layout - Converts rows into collapsible cards */}
      <div className="block md:hidden flex flex-col gap-3 w-full">
        {data.map((item, index) => {
          const id = (item as any).id ?? index
          const isExpanded = !!expandedItems[id]
          
          return (
            <div 
              key={id} 
              className="bg-card border rounded-lg overflow-hidden shadow-xs hover:border-muted-foreground/20 transition-colors"
            >
              {/* Header card summary trigger */}
              <div
                onClick={() => toggleExpand(id)}
                className="p-4 flex items-center justify-between gap-4 font-medium text-foreground cursor-pointer select-none"
              >
                <div className="flex-1 min-w-0">
                  {renderMobileHeader(item)}
                </div>
                <div className="p-1 hover:bg-muted rounded-md transition-colors shrink-0">
                  {isExpanded ? (
                    <CaretUpIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <CaretDownIcon className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Collapsible Details Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t bg-muted/10 flex flex-col gap-3 text-xs text-muted-foreground animate-in fade-in duration-200">
                  {renderMobileDetails(item)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
