import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponsiveTable } from "@/components/responsive-table"
import { toast } from "sonner"

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const transactions = [
    { id: "TXN-7341", client: "Mani Kumar", amount: "₹1,649.00", date: "2026-06-25", status: "Succeeded" },
    { id: "TXN-7340", client: "Suresh Raina", amount: "₹2,198.00", date: "2026-06-22", status: "Succeeded" },
    { id: "TXN-7339", client: "Ramesh Kumar", amount: "₹4,500.00", date: "2026-06-20", status: "Succeeded" },
    { id: "TXN-7338", client: "Aditya Roy", amount: "₹799.00", date: "2026-06-19", status: "Pending" },
    { id: "TXN-7337", client: "Vikram Seth", amount: "₹399.00", date: "2026-06-18", status: "Failed" },
  ]

  const filteredTransactions = transactions.filter(t => 
    t.client.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  )

  const triggerExport = () => {
    toast.info("Preparing transaction export...")
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Payments & Invoices</h2>
          <p className="text-sm text-muted-foreground">Track financial logs, transactions, and client billing details.</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full max-w-md">
          <Input 
            placeholder="Search client or transaction ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card flex-1"
          />
          <Button 
            variant="outline"
            onClick={triggerExport}
            className="shrink-0 cursor-pointer"
          >
            Export Report
          </Button>
        </div>
      </div>

      <ResponsiveTable
        data={filteredTransactions}
        renderMobileHeader={(tx) => (
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-semibold text-foreground truncate">{tx.id}</span>
            <span className="text-xs text-muted-foreground truncate">{tx.client}</span>
          </div>
        )}
        renderMobileDetails={(tx) => (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">{tx.amount}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{tx.date}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="font-semibold text-muted-foreground">Status</span>
              <Badge 
                variant="outline" 
                className={`text-[10px] font-semibold ${
                  tx.status === "Succeeded" 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                    : tx.status === "Pending" 
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                }`}
              >
                {tx.status}
              </Badge>
            </div>
          </div>
        )}
        desktopTable={
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono font-medium text-foreground">{tx.id}</TableCell>
                        <TableCell className="font-medium text-muted-foreground">{tx.client}</TableCell>
                        <TableCell className="font-semibold text-foreground">{tx.amount}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`font-medium ${
                              tx.status === "Succeeded" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                                : tx.status === "Pending" 
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No transactions found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        }
      />
    </div>
  )
}
