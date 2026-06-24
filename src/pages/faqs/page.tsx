import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

export default function FAQsPage() {
  const [search, setSearch] = useState("")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "How do I create a new document in Constructables?",
      a: "Click on any active workspace folders or use the Quick Create component (if enabled in settings) to instantly boot a new layout template. Select a layout schema (Safety Log, Report, Invoice) and fill out the fields."
    },
    {
      q: "Can I export document files in formats other than PDF?",
      a: "Yes! Currently, you can export reports and logs to PDF, Excel Spreadsheet (XLSX), or JSON data formats directly from the document details panel."
    },
    {
      q: "How do user permissions and supervisor roles work?",
      a: "Administrators can assign roles under the 'Users' tab. Super supervisors can view and approve all forms, editors can compose drafts, and viewers have read-only access to files."
    },
    {
      q: "What is the custom branding feature?",
      a: "Constructables supports company-wide white-labeling. You can upload your own SVG/PNG logo, adjust the primary theme variables to match your brand hex colors, and configure support email headers in settings."
    },
    {
      q: "How do I toggle the dark mode interface?",
      a: "Navigate to the 'Settings' tab. Under application aesthetics, you can switch between Light, Dark, or System mode. Settings will persist across browser reload cycles."
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(search.toLowerCase()) || 
    faq.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Frequently Asked Questions</h2>
        <p className="text-sm text-muted-foreground">Find fast answers to operations, safety reports, billing, and system configurations.</p>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Input 
          placeholder="Search FAQs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx
            return (
              <Card 
                key={idx} 
                className="overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-medium text-foreground hover:bg-muted/30 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <CaretUpIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t bg-muted/10">
                    {faq.a}
                  </div>
                )}
              </Card>
            )
          })
        ) : (
          <Card className="border-dashed bg-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              No FAQ entries match your search criteria.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
