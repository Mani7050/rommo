import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash, Edit, MapPin, Tag } from "lucide-react"

interface Workspace {
  id: string
  title: string
  location: string
  price: number
  type: "Suite" | "Workspace" | "Room" | "Monthly"
  rating: number
  reviews: number
  status: "Available" | "Maintenance"
  image: string
}

export default function WorkspacesPage() {
  const [search, setSearch] = useState("")
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "d1", title: "Luxury Penthouse Suite", location: "Lavelle Road, Bangalore", price: 5499, image: "/comfort_room.png", rating: 4.9, type: "Suite", reviews: 48, status: "Available" },
    { id: "d2", title: "Creative Focus Cabin", location: "HSR Layout, Bangalore", price: 650, image: "/meeting_room.png", rating: 4.7, type: "Workspace", reviews: 112, status: "Available" },
    { id: "d3", title: "Greenery Studio Apartment", location: "Koramangala, Bangalore", price: 1899, image: "/urban_studio.png", rating: 4.8, type: "Room", reviews: 89, status: "Available" },
    { id: "d4", title: "Executive Boardroom", location: "Indiranagar, Bangalore", price: 1500, image: "/meeting_room.png", rating: 4.6, type: "Workspace", reviews: 34, status: "Maintenance" },
    { id: "d5", title: "Bachelor Monthly Room", location: "Koramangala, Bangalore", price: 14500, image: "/urban_studio.png", rating: 4.5, type: "Monthly", reviews: 67, status: "Available" }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [type, setType] = useState<Workspace["type"]>("Workspace")
  const [status, setStatus] = useState<Workspace["status"]>("Available")

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !location || !price) {
      toast.error("Please fill in all fields.")
      return
    }

    const newWS: Workspace = {
      id: `d-${Date.now()}`,
      title,
      location,
      price: Number(price),
      type,
      rating: 5.0,
      reviews: 0,
      status,
      image: type === "Suite" || type === "Room" ? "/urban_studio.png" : "/meeting_room.png"
    }

    setWorkspaces([newWS, ...workspaces])
    setTitle("")
    setLocation("")
    setPrice("")
    setIsAdding(false)
    toast.success(`Workspace "${newWS.title}" added successfully!`)
  }

  const handleDeleteWorkspace = (id: string, name: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id))
    toast.success(`Workspace "${name}" removed.`)
  }

  const toggleStatus = (id: string) => {
    setWorkspaces(workspaces.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === "Available" ? "Maintenance" : "Available"
        toast.success(`Status updated for "${w.title}"`)
        return { ...w, status: nextStatus }
      }
      return w
    }))
  }

  const filtered = workspaces.filter(w => 
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-5xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground font-sans">Workspace Cabins & Suites</h2>
          <p className="text-sm text-muted-foreground">Add, edit, or toggle availability status of desks, cabins, and suites.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-xs transition-all border-0"
        >
          <Plus className="size-4" />
          {isAdding ? "Cancel" : "Add Cabin/Room"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border shadow-xs max-w-xl animate-fade-in">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold">Register New Space</CardTitle>
            <CardDescription className="text-xs">Publish a new workspace category on the Rommo mobile application.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddWorkspace}>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Workspace Name</label>
                <Input 
                  placeholder="e.g. Cozy Corner Hot Desk, Premium Studio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Location / Address</label>
                  <Input 
                    placeholder="e.g. HSR Layout, Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Price starting (₹)</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 1500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Workspace Type</label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Workspace">Workspace</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Initial Status</label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg px-4 py-2 border-0 cursor-pointer"
                >
                  Publish Space
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-2 max-w-md">
        <Input 
          placeholder="Search cabins, rooms, or locations..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card shadow-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ws) => (
          <Card key={ws.id} className="overflow-hidden border bg-card flex flex-col justify-between">
            <div>
              <div className="relative h-44 bg-muted overflow-hidden">
                <img 
                  src={ws.image} 
                  alt={ws.title} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    // Fallback placeholder
                    e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
                  }}
                />
                <Badge className="absolute top-2 left-2 bg-zinc-950/70 border-0 text-white font-semibold text-[9px] uppercase tracking-wide">
                  {ws.type}
                </Badge>
                <Badge 
                  className={`absolute top-2 right-2 border-0 font-semibold text-[9px] cursor-pointer ${
                    ws.status === "Available" 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                      : "bg-rose-500 text-white hover:bg-rose-600"
                  }`}
                  onClick={() => toggleStatus(ws.id)}
                >
                  {ws.status}
                </Badge>
              </div>

              <CardContent className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">{ws.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{ws.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="size-3.5 text-primary shrink-0" />
                  <span>Rating: <strong className="text-foreground">{ws.rating}</strong> ({ws.reviews} reviews)</span>
                </div>
              </CardContent>
            </div>

            <div className="px-4 pb-4 pt-1 flex justify-between items-center border-t border-muted/50 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Price starting</span>
                <span className="text-sm font-bold text-primary">₹{ws.price}<span className="text-[10px] font-normal text-muted-foreground">/night</span></span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(ws.id)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                  title="Toggle active status"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={() => handleDeleteWorkspace(ws.id, ws.title)}
                  className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                  title="Delete workspace"
                >
                  <Trash className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
