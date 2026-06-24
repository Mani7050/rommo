import * as React from "react"
import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  SquaresFourIcon,
  UsersIcon,
  CreditCardIcon,
  ChatIcon,
  QuestionIcon,
  GearIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react"

const pathToTabMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/payments": "Payments",
  "/support-tickets": "Support Tickets",
  "/faqs": "FAQs",
  "/settings": "Settings",
}

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const activeTab = pathToTabMap[location.pathname] || "Dashboard"

  const primaryNavItems = [
    { title: "Dashboard", path: "/dashboard", icon: <SquaresFourIcon className="size-5" /> },
    { title: "Users", path: "/users", icon: <UsersIcon className="size-5" /> },
    { title: "Payments", path: "/payments", icon: <CreditCardIcon className="size-5" /> },
    { title: "Support Tickets", path: "/support-tickets", icon: <ChatIcon className="size-5" /> },
  ]

  const moreNavItems = [
    { title: "FAQs", path: "/faqs", icon: <QuestionIcon className="size-5" /> },
    { title: "Settings", path: "/settings", icon: <GearIcon className="size-5" /> },
  ]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <AppSidebar className="hidden md:flex" />
      <SidebarInset>
        <SiteHeader activeTab={activeTab} />
        <div className="flex flex-1 flex-col pb-20 md:pb-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md px-2 py-2 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {primaryNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.title}
                onClick={() => {
                  navigate(item.path)
                  setShowMoreMenu(false)
                }}
                className={`flex flex-col items-center gap-1 py-1 px-1 rounded-lg transition-all duration-200 active:scale-95 flex-1 min-w-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                <span className="text-[9px] tracking-tight truncate max-w-full">
                  {item.title}
                </span>
              </button>
            )
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-1 py-1 px-1 rounded-lg transition-all duration-200 active:scale-95 flex-1 min-w-0 ${
              showMoreMenu || moreNavItems.some(i => location.pathname === i.path)
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <DotsThreeIcon className="size-5" weight="bold" />
            <span className="text-[9px] tracking-tight truncate max-w-full">
              More
            </span>
          </button>
        </div>

        {/* More Menu Bottom Card Overlay */}
        {showMoreMenu && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] flex items-end justify-center animate-in fade-in duration-200"
            onClick={() => setShowMoreMenu(false)}
          >
            <div 
              className="bg-card w-full rounded-t-2xl p-6 border-t shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-250 pb-24"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-sm text-foreground">More Options</h3>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="text-xs font-semibold text-primary hover:text-primary/80 border-0 bg-transparent cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                {moreNavItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        navigate(item.path)
                        setShowMoreMenu(false)
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all active:scale-95 gap-2 cursor-pointer ${
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-foreground border-transparent"
                      }`}
                    >
                      {item.icon}
                      <span className="text-xs font-medium">{item.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
