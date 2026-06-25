import { useState, useEffect, useRef } from "react"
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
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

function getInitials(name: string) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ]
  let hash = 0
  const cleanName = name || "User"
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Project Manager",
    status: "Active",
  })

  const isSeededRef = useRef(false)

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const usersList: any[] = []
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() })
      })

      if (snapshot.empty && !isSeededRef.current) {
        isSeededRef.current = true
        const defaultUsers = [
          { name: "John Doe", email: "john@constructables.com", role: "Administrator", status: "Active" },
          { name: "Jane Smith", email: "jane@constructables.com", role: "Project Manager", status: "Active" },
          { name: "Alex Johnson", email: "alex@constructables.com", role: "Site Supervisor", status: "Pending" },
          { name: "Sarah Lee", email: "sarah@constructables.com", role: "Safety Officer", status: "Active" },
          { name: "Michael Brown", email: "michael@constructables.com", role: "Contractor", status: "Suspended" },
        ]
        
        toast.info("Initializing database with demo users...")
        try {
          for (const u of defaultUsers) {
            await addDoc(collection(db, "users"), {
              ...u,
              createdAt: serverTimestamp()
            })
          }
          toast.success("Database initialized successfully!")
        } catch (err) {
          console.error("Error seeding database:", err)
          toast.error("Failed to initialize database with demo users")
        }
      } else {
        setUsers(usersList)
        setLoading(false)
      }
    }, (error) => {
      console.error("Firestore subscription error:", error)
      toast.error("Failed to fetch users from database")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Project Manager",
      status: user.status || "Active",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user: ${name}?`)) {
      try {
        await deleteDoc(doc(db, "users", id))
        toast.success(`Deleted user: ${name}`)
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error(`Failed to delete user: ${name}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
        })
        toast.success("User updated successfully!")
      } else {
        await addDoc(collection(db, "users"), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          createdAt: serverTimestamp(),
        })
        toast.success("User added successfully!")
      }
      setIsOpen(false)
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Failed to save user")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">User Directory</h2>
            <p className="text-sm text-muted-foreground">Manage user accounts, system access permissions, and roles.</p>
          </div>
          
          <div className="flex flex-row items-center gap-2 w-full max-w-md">
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
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
        </div>
      </div>

      <ResponsiveTable
        data={filteredUsers}
        renderMobileHeader={(user) => (
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-full font-medium flex items-center justify-center text-xs shadow-xs ${getAvatarColor(user.name)}`}>
              {getInitials(user.name)}
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
                onClick={() => handleEdit(user)}
                className="cursor-pointer"
              >
                <PencilSimpleIcon className="size-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(user.id, user.name)}
                className="cursor-pointer bg-rose-500/10 text-rose-600 border-0 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30"
              >
                <TrashIcon className="size-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
        desktopTable={
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[35%]">Name</TableHead>
                    <TableHead className="w-[35%]">Email</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <div className={`size-8 rounded-full font-medium flex items-center justify-center text-xs shadow-xs ${getAvatarColor(user.name)}`}>
                            {getInitials(user.name)}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">{user.email}</TableCell>
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
                              onClick={() => handleEdit(user)}
                              className="cursor-pointer"
                            >
                              <PencilSimpleIcon className="size-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(user.id, user.name)}
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
        }
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{editingUser ? "Edit User" : "Add New User"}</SheetTitle>
            <SheetDescription>
              {editingUser 
                ? "Modify the user's details and roles in the system." 
                : "Create a new user account and set their access role."
              }
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between py-4">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-card"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@constructables.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-card"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
                    <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            
            <div className="flex justify-end gap-2.5 pt-6 mt-auto border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingUser ? "Save Changes" : "Add User"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
