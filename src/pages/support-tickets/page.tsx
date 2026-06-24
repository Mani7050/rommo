import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("")
  const tickets = [
    { id: "TKT-8902", title: "Cannot export large document to PDF", customer: "Delta Builders", priority: "High", status: "Open", date: "2 hours ago" },
    { id: "TKT-8891", title: "Add custom branding options request", customer: "Apex Engineering", priority: "Medium", status: "In Progress", date: "1 day ago" },
    { id: "TKT-8874", title: "Receipt generation delay", customer: "Safety First LLC", priority: "Low", status: "Resolved", date: "3 days ago" },
    { id: "TKT-8850", title: "SSO login configuration issue", customer: "Wernham Hogg", priority: "High", status: "Open", date: "4 days ago" },
  ]

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.customer.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateTicket = () => {
    toast.success("Opening new support ticket dialog...")
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">Manage active inquiries, customer issues, and feature requests.</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full max-w-md">
          <Input 
            placeholder="Search ticket title, client, or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card flex-1"
          />
          <Button 
            onClick={handleCreateTicket}
            size="lg"
            className="shrink-0 cursor-pointer"
          >
            <PlusIcon className="size-4 mr-1.5" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-xs transition-shadow">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {ticket.id}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        ticket.priority === "High" 
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" 
                          : ticket.priority === "Medium" 
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                      }`}
                    >
                      {ticket.priority} Priority
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {ticket.date}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground text-base">{ticket.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{ticket.customer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end border-t pt-3 md:border-t-0 md:pt-0">
                  <Badge 
                    variant="outline" 
                    className={`gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                      ticket.status === "Open" 
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" 
                        : ticket.status === "In Progress" 
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${
                      ticket.status === "Open" ? "bg-rose-500" : ticket.status === "In Progress" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    {ticket.status}
                  </Badge>

                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info(`Viewing details for: ${ticket.id}`)}
                    className="cursor-pointer"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              No support tickets found matching your query.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
