import * as React from "react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Link, useLocation } from "react-router-dom"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SquaresFourIcon, UsersIcon, CreditCardIcon, ChatIcon, QuestionIcon, GearIcon } from "@phosphor-icons/react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <SquaresFourIcon />
      ),
      isActive: true,
    },
    {
      title: "Users",
      url: "/users",
      icon: (
        <UsersIcon />
      ),
    },
    {
      title: "Payments",
      url: "/payments",
      icon: (
        <CreditCardIcon />
      ),
    },
    {
      title: "Support Tickets",
      url: "/support-tickets",
      icon: (
        <ChatIcon />
      ),
    },
    {
      title: "FAQs",
      url: "/faqs",
      icon: (
        <QuestionIcon />
      ),
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const location = useLocation()
  const [user, setUser] = useState({
    name: "Admin",
    email: "admin@contractables.com",
    avatar: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || "admin@contractables.com"
        const namePart = email.split("@")[0]
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1)
        setUser({
          name: firebaseUser.displayName || capitalized,
          email: email,
          avatar: firebaseUser.photoURL || "",
        })
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <img src="/logo.svg" alt="Logo" className="size-10" />
                <span className="text-base font-semibold">Constructables</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/settings"}
              className="cursor-pointer animate-fade-in"
            >
              <Link to="/settings">
                <GearIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
