import { Link, useLocation } from "react-router-dom"
import { toast } from "sonner"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isUsers = item.title === "Users"
            const isActive = location.pathname === item.url
            
            const handleClick = (e: React.MouseEvent) => {
              if (!isUsers) {
                e.preventDefault()
                toast.warning("Under progress", {
                  description: `${item.title} is currently under development.`,
                })
              }
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={!isUsers ? "opacity-60 hover:opacity-100 cursor-pointer" : "cursor-pointer"}
                >
                  <Link to={isUsers ? item.url : "#"} onClick={handleClick}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
