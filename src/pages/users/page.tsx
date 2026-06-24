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
import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@constructables.com", role: "Administrator", status: "Active", initials: "JD", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { id: 2, name: "Jane Smith", email: "jane@constructables.com", role: "Project Manager", status: "Active", initials: "JS", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { id: 3, name: "Alex Johnson", email: "alex@constructables.com", role: "Site Supervisor", status: "Pending", initials: "AJ", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { id: 4, name: "Sarah Lee", email: "sarah@constructables.com", role: "Safety Officer", status: "Active", initials: "SL", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { id: 5, name: "Michael Brown", email: "michael@constructables.com", role: "Contractor", status: "Suspended", initials: "MB", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddUser = () => {
    toast.success("Add User dialog opened! (Demo mode)")
  }

  const handleDelete = (name: string) => {
    toast.error(`Deleted user: ${name}`, {
      duration: 2000
    })
  }

  const handleEdit = (name: string) => {
    toast.info(`Editing user: ${name}`)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">User Directory</h2>
          <p className="text-sm text-muted-foreground">Manage user accounts, system access permissions, and roles.</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full max-w-md">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card flex-1"
          />
          <Button 
            onClick={handleAddUser}
            size="lg"
            className="shrink-0 cursor-pointer"
          >
            <PlusIcon className="size-4 mr-1.5" />
            Add User
          </Button>
        </div>
      </div>

      <ResponsiveTable
        data={filteredUsers}
        renderMobileHeader={(user) => (
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-full font-medium flex items-center justify-center text-xs shadow-xs ${user.color}`}>
              {user.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
        renderMobileDetails={(user) => (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground">Role</span>
              <span className="font-medium text-foreground">{user.role}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground">Status</span>
              <Badge 
                variant="outline" 
                className={`text-[10px] font-semibold ${
                  user.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                    : user.status === "Pending" 
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                }`}
              >
                {user.status}
              </Badge>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleEdit(user.name)}
                className="cursor-pointer"
              >
                <PencilSimpleIcon className="size-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(user.name)}
                className="cursor-pointer bg-rose-500/10 text-rose-600 border-0 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30"
              >
                <TrashIcon className="size-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
        desktopTable={
          <div className="rounded-md border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">User</TableHead>
                    <TableHead className="w-[30%]">Role</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <div className={`size-8 rounded-full font-medium flex items-center justify-center text-xs shadow-xs ${user.color}`}>
                            {user.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">{user.role}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`gap-1.5 font-medium ${
                              user.status === "Active" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                                : user.status === "Pending" 
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${
                              user.status === "Active" ? "bg-emerald-500" : user.status === "Pending" ? "bg-amber-500" : "bg-rose-500"
                            }`} />
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit(user.name)}
                              className="cursor-pointer"
                            >
                              <PencilSimpleIcon className="size-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(user.name)}
                              className="hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        }
      />
    </div>
  )
}
