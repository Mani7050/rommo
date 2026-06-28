import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tag, Plus, Trash, Copy } from "lucide-react"

interface Offer {
  code: string
  discount: string
  description: string
  expiry: string
}

export default function OffersPage() {
  const [search, setSearch] = useState("")
  const [offers, setOffers] = useState<Offer[]>([
    { code: "WELCOME10", discount: "10% OFF", description: "Get 10% off on your first workspace booking.", expiry: "31 Dec 2026" },
    { code: "COWORKING20", discount: "20% OFF", description: "Special discount for weekly solo work pod bookings.", expiry: "30 Nov 2026" },
    { code: "SUITE30", discount: "30% OFF", description: "Luxury Penthouse Suite corporate launch offer.", expiry: "15 Oct 2026" },
    { code: "MEET50", discount: "50% OFF", description: "Flat 50% discount on Meeting Room bookings on weekdays.", expiry: "31 Aug 2026" }
  ])

  const [newCode, setNewCode] = useState("")
  const [newDiscount, setNewDiscount] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newExpiry, setNewExpiry] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode || !newDiscount || !newDesc || !newExpiry) {
      toast.error("Please fill in all fields.")
      return
    }

    const newOffer: Offer = {
      code: newCode.toUpperCase().replace(/\s+/g, ""),
      discount: newDiscount,
      description: newDesc,
      expiry: newExpiry
    }

    setOffers([newOffer, ...offers])
    setNewCode("")
    setNewDiscount("")
    setNewDesc("")
    setNewExpiry("")
    setIsAdding(false)
    toast.success(`Promo code ${newOffer.code} added successfully!`)
  }

  const handleDeleteOffer = (codeToDelete: string) => {
    setOffers(offers.filter(o => o.code !== codeToDelete))
    toast.success(`Promo code ${codeToDelete} deleted successfully.`)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied code: ${code}`)
  }

  const filteredOffers = offers.filter(o => 
    o.code.toLowerCase().includes(search.toLowerCase()) || 
    o.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-4xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground font-sans">Promo Offers & Discounts</h2>
          <p className="text-sm text-muted-foreground">Manage active discount coupons and promotional offers for Rommo customers.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-xs transition-all border-0"
        >
          <Plus className="size-4" />
          {isAdding ? "Cancel" : "Add Offer"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border shadow-xs max-w-xl animate-fade-in">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold">Create New Coupon Offer</CardTitle>
            <CardDescription className="text-xs">Fill in code details to publish a new discount on the user app.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddOffer}>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Coupon Code</label>
                  <Input 
                    placeholder="e.g. MONSOON40"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Discount Value</label>
                  <Input 
                    placeholder="e.g. 40% OFF or Flat ₹500"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                <Input 
                  placeholder="e.g. Get 40% off on all meeting rooms bookings."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>

              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Expiry Date</label>
                <Input 
                  placeholder="e.g. 31 Dec 2026"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg px-4 py-2 border-0 cursor-pointer"
                >
                  Create Offer
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-2 max-w-md">
        <Input 
          placeholder="Search promo codes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card shadow-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <Card key={offer.code} className="bg-card hover:shadow-xs transition-all border">
              <CardContent className="p-5 flex flex-col gap-3 justify-between h-full">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-foreground text-sm tracking-wider">{offer.code}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal">{offer.description}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0 font-semibold text-[10px]">
                    {offer.discount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center border-t pt-3 mt-1 text-[11px]">
                  <span className="text-muted-foreground">Expires: <strong className="text-foreground font-medium">{offer.expiry}</strong></span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="p-1 hover:text-primary text-muted-foreground transition-colors cursor-pointer border-0 bg-transparent flex items-center"
                      title="Copy promo code"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.code)}
                      className="p-1 hover:text-destructive text-muted-foreground transition-colors cursor-pointer border-0 bg-transparent flex items-center"
                      title="Delete coupon"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-card/50">
            No active discount codes match your search query.
          </div>
        )}
      </div>
    </div>
  )
}
