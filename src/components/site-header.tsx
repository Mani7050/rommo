import { SidebarTrigger } from "@/components/ui/sidebar"
import { BellIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SiteHeader({ activeTab = "Dashboard" }: { activeTab?: string }) {
  const handleNotify = () => {
    toast.info("You have 3 unread document signing requests.", {
      description: "Tap to review safety logs and updates."
    })
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-background/95 backdrop-blur-xs flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1.5">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          
          {/* Mobile Header Logo & Brand */}
          <div className="md:hidden flex items-center gap-2.5 mr-2">
            <img src="/logo.svg" alt="Constructables Logo" className="h-10 w-auto" />
            <span className="text-lg font-bold text-primary tracking-tight">Constructables</span>
          </div>

          <h1 className="text-base font-semibold text-foreground ml-1 hidden md:block">{activeTab}</h1>
        </div>

        {/* Notification Icon Button on Right */}
        <Button 
          variant="ghost"
          size="icon"
          onClick={handleNotify}
          className="relative text-muted-foreground hover:text-foreground rounded-full active:scale-95 transition-all cursor-pointer border-0"
        >
          <BellIcon className="size-6" />
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
        </Button>
      </div>
    </header>
  )
}
