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
import { PencilSimpleIcon, TrashIcon, UserCircleIcon, DotsThreeVerticalIcon, PlusIcon, MagnifyingGlassIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, CalendarIcon, ClockIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { db, firebaseConfig, auth } from "@/lib/firebase"
import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
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

function formatTimestamp(timestamp: any) {
  if (!timestamp) return "N/A"
  try {
    const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return "N/A"
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "N/A"
  }
}

function Switch({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? "bg-emerald-500" : "bg-muted-foreground/30"}
      `}
    >
      <span
        className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
        style={{
          transform: checked ? "translateX(18px)" : "translateX(2px)"
        }}
      />
    </button>
  )
}



export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleteUserName, setDeleteUserName] = useState<string>("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "",
    status: "Active",
  })
 
  const [limitCount, setLimitCount] = useState(20)
  const [hasMore, setHasMore] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const [hoveredUser, setHoveredUser] = useState<any | null>(null)
  const [hoverCardPos, setHoverCardPos] = useState({ top: 0, left: 0 })
  const hoverTimeoutRef = useRef<any>(null)

  const showHoverCard = (e: React.MouseEvent, user: any) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    const rect = e.currentTarget.getBoundingClientRect()
    
    // Position using viewport-relative coordinates (fixed positioning)
    setHoverCardPos({ 
      top: rect.bottom + 4, 
      left: rect.left 
    })
    setHoveredUser(user)
  }

  const hideHoverCard = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredUser(null)
    }, 200)
  }

  const cancelHideHoverCard = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }


  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "asc"), limit(limitCount + 1))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: any[] = []
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() })
      })
      console.log("Firestore Users Snapshot:", usersList)

      if (usersList.length > limitCount) {
        setHasMore(true)
        setUsers(usersList.slice(0, limitCount))
      } else {
        setHasMore(false)
        setUsers(usersList)
      }
      setLoading(false)
    }, (error) => {
      console.error("Firestore subscription error:", error)
      toast.error("Failed to fetch users from database")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [limitCount])
 
   const filteredUsers = users.filter(u => 
     (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
     (u.email || "").toLowerCase().includes(search.toLowerCase())
   )
 
   const handleAdd = () => {
     setEditingUser(null)
     setIsViewOnly(false)
     setFormErrors({})
     setShowPassword(false)
     setFormData({
       name: "",
       email: "",
       phone: "",
       address: "",
       password: "",
       role: "",
       status: "Active",
     })
     setIsOpen(true)
   }
 
   const handleEdit = (user: any) => {
     setEditingUser(user)
     setIsViewOnly(false)
     setFormErrors({})
     setShowPassword(false)
     setFormData({
       name: user.name || "",
       email: user.email || "",
       phone: user.phone || "",
       address: user.address || "",
       password: "",
       role: user.role || "",
       status: user.status || "Active",
     })
     setIsOpen(true)
   }
 
   const handleView = (user: any) => {
     setEditingUser(user)
     setIsViewOnly(true)
     setFormErrors({})
     setShowPassword(false)
     setFormData({
       name: user.name || "",
       email: user.email || "",
       phone: user.phone || "",
       address: user.address || "",
       password: "",
       role: user.role || "",
       status: user.status || "Active",
     })
     setIsOpen(true)
   }

  const confirmDelete = async () => {
    if (!deleteUserId) return
    try {
      await deleteDoc(doc(db, "users", deleteUserId))
      toast.success(`Deleted user: ${deleteUserName}`)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(`Failed to delete user: ${deleteUserName}`)
    } finally {
      setDeleteUserId(null)
      setDeleteUserName("")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
    try {
      await updateDoc(doc(db, "users", id), {
        status: newStatus
      })
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update user status")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    
    const name = (formData.name || "").trim()
    const email = (formData.email || "").trim()
    const phone = (formData.phone || "").trim()
    const address = (formData.address || "").trim()
    
    if (!name) {
      errors.name = "Full Name is required"
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.email = "Email Address is required"
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address"
    }
    
    const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/
    if (!phone) {
      errors.phone = "Phone number is required"
    } else if (!phoneRegex.test(phone)) {
      errors.phone = "Please enter a valid phone number (10 to 15 digits)"
    }
    
    if (!address) {
      errors.address = "Address is required"
    } else if (address.length < 10) {
      errors.address = "Address must be at least 10 characters long"
    } else if (address.length > 50) {
      errors.address = "Address cannot exceed 50 characters"
    }
    
    if (!editingUser) {
      const password = formData.password
      if (!password) {
        errors.password = "Password is required"
      } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters long"
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }

    setFormErrors({})

    const validatedData = {
      name,
      email,
      phone,
      address,
    }
    setSubmitting(true)
    try {
      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          role: formData.role,
          status: formData.status,
        })
        toast.success("User updated successfully!")
      } else {
        // Create user in Firebase Auth first
        let uid = null
        try {
          const secondaryAppName = `secondary-${Date.now()}`
          const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
          const secondaryAuth = getAuth(secondaryApp)
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, validatedData.email, formData.password)
          uid = userCredential.user.uid
          await deleteApp(secondaryApp)
        } catch (authError: any) {
          console.error("Firebase Auth creation error:", authError)
          let errMsg = "Failed to create authentication account."
          if (authError.code === "auth/email-already-in-use") {
            errMsg = "This email address is already in use."
          } else if (authError.code === "auth/weak-password") {
            errMsg = "The password is too weak."
          } else if (authError.code === "auth/invalid-email") {
            errMsg = "Invalid email address."
          }
          toast.error(errMsg)
          setSubmitting(false)
          return
        }

        // Save user details to Firestore with the same uid as document ID
        await setDoc(doc(db, "users", uid), {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          role: formData.role,
          status: formData.status,
          createdAt: serverTimestamp(),
          tempPassword: formData.password, // Pass temp password to trigger
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

  const handlePasswordReset = async (email: string) => {
    if (!email) return
    setIsResettingPassword(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent successfully!")
    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      toast.error("Failed to send password reset email: " + (error.message || "Unknown error"))
    } finally {
      setIsResettingPassword(false)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">User Directory</h2>
          <p className="text-sm text-muted-foreground">Manage user accounts, system access permissions, and roles.</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full md:w-auto self-stretch md:self-end">
          <div className="relative flex items-center flex-1 md:w-64">
            <MagnifyingGlassIcon className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <Input 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-8 h-8 w-full border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 text-xs"
            />
          </div>
          <Button onClick={handleAdd} className="cursor-pointer h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center gap-1.5 text-xs shrink-0">
            <PlusIcon className="size-3.5" />
            Add User
          </Button>
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
              <span className="font-semibold text-muted-foreground text-xs">Phone</span>
              <span className="text-xs text-foreground font-medium">{user.phone || "—"}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground text-xs">Address</span>
              <span className="text-xs text-foreground font-medium text-right max-w-[200px] break-words">{user.address || "—"}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground text-xs">Joined</span>
              <span className="text-xs text-foreground font-medium">{formatTimestamp(user.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground text-xs">Last Login</span>
              <span className="text-xs text-foreground font-medium">{formatTimestamp(user.lastLogin)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="font-semibold text-muted-foreground text-xs">Status</span>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={user.status === "Active"}
                  onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                />
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
                onClick={() => { setDeleteUserId(user.id); setDeleteUserName(user.name); }}
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
                    <TableHead className="w-[14%]">Name</TableHead>
                    <TableHead className="w-[16%]">Email</TableHead>
                    <TableHead className="w-[12%]">Phone</TableHead>
                    <TableHead className="w-[15%]">Address</TableHead>
                    <TableHead className="w-[14%]">Joined</TableHead>
                    <TableHead className="w-[14%]">Last Login</TableHead>
                    <TableHead className="w-[8%]">Status</TableHead>
                    <TableHead className="w-[7%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <div 
                            onMouseEnter={(e) => showHoverCard(e, user)}
                            onMouseLeave={hideHoverCard}
                            onClick={() => handleView(user)}
                            className="flex items-center gap-3 cursor-pointer group/profile"
                          >
                            <div className={`size-8 rounded-full font-medium flex items-center justify-center text-xs shadow-xs ${getAvatarColor(user.name)} group-hover/profile:ring-2 group-hover/profile:ring-primary/40 transition-all`}>
                              {getInitials(user.name)}
                            </div>
                            <span className="font-medium text-foreground group-hover/profile:text-primary group-hover/profile:underline transition-colors">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="font-medium text-muted-foreground text-xs">{user.phone || "—"}</TableCell>
                        <TableCell className="font-medium text-muted-foreground text-xs max-w-[120px] truncate" title={user.address}>
                          {user.address || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(user.createdAt)}</TableCell>
                        <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(user.lastLogin)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Switch 
                              checked={user.status === "Active"}
                              onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                            />
                            <Badge 
                              variant="outline" 
                              className={`gap-1.5 font-medium select-none ${
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
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost"
                                size="icon-xs"
                                className="cursor-pointer"
                              >
                                <DotsThreeVerticalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer">
                                <PencilSimpleIcon className="size-3.5 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => { setDeleteUserId(user.id); setDeleteUserName(user.name); }} 
                                variant="destructive"
                                className="cursor-pointer"
                              >
                                <TrashIcon className="size-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        }
      />

      {hasMore && (
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimitCount((prev) => prev + 20)}
            className="cursor-pointer text-xs font-semibold h-8 px-4 border-muted-foreground/20 hover:bg-muted"
          >
            Load More Users
          </Button>
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="data-[side=right]:sm:max-w-[480px] flex flex-col h-full p-0">
          <div className="flex-1 overflow-y-auto px-6 pt-6">
            <SheetHeader className="p-0 mb-6">
              <SheetTitle className="text-xl font-bold tracking-tight">
                {isViewOnly ? "User Profile Details" : editingUser ? "Edit User Account" : "Create New User"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                {isViewOnly 
                  ? "Detailed view of the team member's workspace account profile."
                  : editingUser 
                  ? "Modify the user's details, change system permissions, or update status." 
                  : "Fill in the details below to add a new team member to the workspace."
                }
              </SheetDescription>
            </SheetHeader>

            {/* Profile Avatar Preview Block */}
            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-muted/80 mb-6 shadow-xs">
              {editingUser ? (
                <div className={`size-14 rounded-full font-bold flex items-center justify-center text-lg shadow-sm border border-background shrink-0 select-none ${getAvatarColor(formData.name)}`}>
                  {getInitials(formData.name)}
                </div>
              ) : (
                <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs border border-background shrink-0 select-none">
                  <UserCircleIcon className="size-8" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-foreground truncate">
                  {formData.name.trim() || (isViewOnly ? "User Details" : editingUser ? "User Details" : "New Member")}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {formData.email.trim() || "No email address set"}
                </span>
              </div>
            </div>
            
            {isViewOnly ? (
              <div className="space-y-6 pb-6">
                {/* Section 1: Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">User Profile Details</span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Full Name</span>
                      <span className="text-sm font-semibold text-foreground">{formData.name || "—"}</span>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Email Address</span>
                      <span className="text-sm font-semibold text-foreground break-all">{formData.email || "—"}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Phone Number</span>
                      <span className="text-sm font-semibold text-foreground">{formData.phone || "—"}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">System Role</span>
                      <span className="text-sm font-semibold text-foreground">{formData.role || "—"}</span>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Address</span>
                      <span className="text-sm font-semibold text-foreground whitespace-pre-wrap">{formData.address || "—"}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Joined Date</span>
                      <span className="text-xs font-medium text-foreground">{editingUser ? formatTimestamp(editingUser.createdAt) : "—"}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Last Login</span>
                      <span className="text-xs font-medium text-foreground">{editingUser ? formatTimestamp(editingUser.lastLogin) : "—"}</span>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">Account Status</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Switch 
                          checked={formData.status === "Active"}
                          onCheckedChange={(checked) => {
                            if (editingUser) {
                              handleToggleStatus(editingUser.id, formData.status)
                              setFormData({ ...formData, status: checked ? "Active" : "Inactive" })
                            }
                          }}
                        />
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-semibold select-none ${
                            formData.status === "Active" 
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                              : formData.status === "Pending" 
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                          }`}
                        >
                          {formData.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form id="user-form" onSubmit={handleSubmit} className="space-y-6 pb-6" autoComplete="off">
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Personal Details</span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>

                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel htmlFor="name" className="text-xs font-semibold text-foreground/80">Full Name</FieldLabel>
                      <Input
                        id="name"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (formErrors.name) {
                            setFormErrors(prev => {
                              const updated = { ...prev }
                              delete updated.name
                              return updated
                            })
                          }
                        }}
                        className={`bg-card h-10 border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                          formErrors.name ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-[10px] font-medium text-destructive mt-1">{formErrors.name}</p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email" className="text-xs font-semibold text-foreground/80">Email Address</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="new-email"
                        placeholder="e.g. john@rommo.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (formErrors.email) {
                            setFormErrors(prev => {
                              const updated = { ...prev }
                              delete updated.email
                              return updated
                            })
                          }
                        }}
                        className={`bg-card h-10 border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                          formErrors.email ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[10px] font-medium text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </Field>

                    {!editingUser && (
                      <Field>
                        <FieldLabel htmlFor="password" className="text-xs font-semibold text-foreground/80">Password</FieldLabel>
                        <div className="relative flex items-center">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={(e) => {
                              setFormData({ ...formData, password: e.target.value })
                              if (formErrors.password) {
                                setFormErrors(prev => {
                                  const updated = { ...prev }
                                  delete updated.password
                                  return updated
                                })
                              }
                            }}
                            className={`bg-card h-10 pr-10 w-full border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                              formErrors.password ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center p-1"
                          >
                            {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <p className="text-[10px] font-medium text-destructive mt-1">{formErrors.password}</p>
                        )}
                      </Field>
                    )}

                    <Field>
                      <FieldLabel htmlFor="phone" className="text-xs font-semibold text-foreground/80">Phone Number</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          if (formErrors.phone) {
                            setFormErrors(prev => {
                              const updated = { ...prev }
                              delete updated.phone
                              return updated
                            })
                          }
                        }}
                        className={`bg-card h-10 border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                          formErrors.phone ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] font-medium text-destructive mt-1">{formErrors.phone}</p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="address" className="text-xs font-semibold text-foreground/80">Address</FieldLabel>
                      <Input
                        id="address"
                        maxLength={50}
                        placeholder="e.g. 123 Main St, New York"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value })
                          if (formErrors.address) {
                            setFormErrors(prev => {
                              const updated = { ...prev }
                              delete updated.address
                              return updated
                            })
                          }
                        }}
                        className={`bg-card h-10 border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                          formErrors.address ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1 select-none">
                        <span className="text-[9px] text-muted-foreground">Address must be between 10 and 50 characters</span>
                        <span className="text-[9px] text-muted-foreground">{formData.address.length}/50</span>
                      </div>
                      {formErrors.address && (
                        <p className="text-[10px] font-medium text-destructive mt-1">{formErrors.address}</p>
                      )}
                    </Field>
                  </FieldGroup>
                </div>

                {/* Section 2: Access Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Access & Settings</span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>

                  <FieldGroup className="gap-4">
                    <Field>
                      <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-muted-foreground/20">
                        <div className="flex flex-col gap-0.5">
                          <FieldLabel htmlFor="status" className="text-xs font-semibold text-foreground/80">Account Active</FieldLabel>
                          <span className="text-[10px] text-muted-foreground">Toggle to set status to Active or Inactive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.status === "Active"}
                            onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Active" : "Inactive" })}
                          />
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-semibold select-none ${
                              formData.status === "Active" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                                : formData.status === "Pending" 
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                            }`}
                          >
                            {formData.status}
                          </Badge>
                        </div>
                      </div>
                    </Field>

                    {editingUser && (
                      <Field>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isResettingPassword}
                          onClick={() => handlePasswordReset(formData.email)}
                          className="w-full cursor-pointer h-9 text-xs font-semibold border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/20"
                        >
                          {isResettingPassword ? "Sending Reset Email..." : "Send Password Reset Email"}
                        </Button>
                      </Field>
                    )}
                  </FieldGroup>
                </div>
              </form>
            )}
          </div>
          
          <div className="flex justify-end gap-3 px-6 py-4 mt-auto border-t bg-muted/20">
            {isViewOnly ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                className="h-10 px-6 cursor-pointer"
              >
                Close
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  disabled={submitting}
                  className="h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="user-form"
                  disabled={submitting}
                  className="h-10 px-5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  {submitting ? "Saving..." : editingUser ? "Save Changes" : "Add User"}
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) { setDeleteUserId(null); setDeleteUserName(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{" "}
              <span className="font-semibold text-foreground">{deleteUserName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {hoveredUser && (
        <div
          style={{
            position: "fixed",
            top: hoverCardPos.top,
            left: hoverCardPos.left,
            zIndex: 100,
          }}
          onMouseEnter={cancelHideHoverCard}
          onMouseLeave={hideHoverCard}
          className="w-80 bg-popover text-popover-foreground rounded-none border border-muted-foreground/20 shadow-sm p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Header section with avatar, name, and role */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className={`size-14 rounded-full font-bold flex items-center justify-center text-lg shadow-sm border border-background shrink-0 select-none ${getAvatarColor(hoveredUser.name)}`}>
                {getInitials(hoveredUser.name)}
              </div>
              {hoveredUser.status === "Active" && (
                <span className="absolute bottom-0 right-0 size-4 bg-emerald-500 rounded-full border-2 border-popover flex items-center justify-center">
                  <span className="size-1.5 bg-white rounded-full" />
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground leading-tight truncate">{hoveredUser.name}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                <BriefcaseIcon className="size-3.5 shrink-0" />
                {hoveredUser.role || "Member"}
              </span>
              <span className="text-[9px] inline-flex items-center gap-1 mt-1 text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-max">
                <span className="size-1 rounded-full bg-emerald-500" />
                {hoveredUser.status}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 mt-4 border-t border-b border-muted-foreground/10 py-2.5">
            <a 
              href={`mailto:${hoveredUser.email}`}
              title="Send email"
              className="size-8 rounded-none bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
            >
              <EnvelopeIcon className="size-4" />
            </a>
            {hoveredUser.phone && (
              <a 
                href={`tel:${hoveredUser.phone}`}
                title="Call phone"
                className="size-8 rounded-none bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
              >
                <PhoneIcon className="size-4" />
              </a>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-2 mt-4">
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <EnvelopeIcon className="size-3.5 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-medium text-muted-foreground/75">Email</span>
                <span className="text-foreground text-[11px] break-all">{hoveredUser.email}</span>
              </div>
            </div>

            {hoveredUser.phone && (
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <PhoneIcon className="size-3.5 shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-medium text-muted-foreground/75">Phone</span>
                  <span className="text-foreground text-[11px]">{hoveredUser.phone}</span>
                </div>
              </div>
            )}

            {hoveredUser.address && (
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-medium text-muted-foreground/75">Address</span>
                  <span className="text-foreground text-[11px] whitespace-pre-wrap">{hoveredUser.address}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <CalendarIcon className="size-3.5 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-medium text-muted-foreground/75">Joined</span>
                <span className="text-foreground text-[11px]">{formatTimestamp(hoveredUser.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <ClockIcon className="size-3.5 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-medium text-muted-foreground/75">Last Login</span>
                <span className="text-foreground text-[11px]">{formatTimestamp(hoveredUser.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
