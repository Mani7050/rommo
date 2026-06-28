import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SettingsPage() {
  const [company, setCompany] = useState("Rommo")
  const [email, setEmail] = useState("support@rommo.com")
  const [language, setLanguage] = useState("en")
  const [twoFactor, setTwoFactor] = useState(true)
  const [notify, setNotify] = useState(true)
  const [theme, setTheme] = useState("light")
  const [saving, setSaving] = useState(false)

  // SMTP Settings States
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPass, setSmtpPass] = useState("")
  const [smtpSecure, setSmtpSecure] = useState(false)
  const [senderEmail, setSenderEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    getDoc(doc(db, "settings", "system"))
      .then((docSnap) => {
        if (!docSnap.exists()) return
        const data = docSnap.data()
        setCompany(data.company || "Rommo")
        setEmail(data.email || "support@rommo.com")
        setLanguage(data.language || "en")
        setTwoFactor(data.twoFactor !== undefined ? data.twoFactor : true)
        setNotify(data.notify !== undefined ? data.notify : true)
        setTheme(data.theme || "light")
        setSmtpHost(data.smtpHost || "")
        setSmtpPort(data.smtpPort || "587")
        setSmtpUser(data.smtpUser || "")
        setSmtpPass(data.smtpPass || "")
        setSmtpSecure(data.smtpSecure !== undefined ? data.smtpSecure : false)
        setSenderEmail(data.senderEmail || "")
      })
      .catch((err) => {
        console.error("Error fetching settings:", err)
        toast.error("Could not fetch settings from Firestore.")
      })
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const settingsPayload = {
      company,
      email,
      language,
      twoFactor,
      notify,
      theme,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      senderEmail,
    }

    setDoc(doc(db, "settings", "system"), settingsPayload)
      .then(() => {
        toast.success("Settings updated successfully!", {
          duration: 2000,
        })
      })
      .catch((err) => {
        console.error("Save error:", err)
        toast.error(err.message || "Failed to save settings to Firestore")
      })
      .finally(() => {
        setSaving(false)
      })
  }


  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">System Settings</h2>
        <p className="text-sm text-muted-foreground">Adjust system branding, language parameters, and account safety configurations.</p>
      </div>

      <Card>
        <form onSubmit={handleSave}>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</label>
                <Input 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support Email Address</label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Separator className="my-1" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">App Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Español (ES)</SelectItem>
                    <SelectItem value="fr">Français (FR)</SelectItem>
                    <SelectItem value="de">Deutsch (DE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Theme Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {["light", "dark", "system"].map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={theme === mode ? "default" : "outline"}
                      onClick={() => setTheme(mode)}
                      className="capitalize cursor-pointer font-semibold"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">SMTP Mail Server Settings</h3>
                <p className="text-xs text-muted-foreground">Configure dynamic credentials to send transactional notifications and welcome emails.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SMTP Username / Email</label>
                  <Input 
                    type="email"
                    name="smtp_username_field"
                    autoComplete="new-email"
                    placeholder="e.g. username@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SMTP App Password</label>
                  <div className="relative flex items-center">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      name="smtp_password_field"
                      autoComplete="new-password"
                      placeholder="Enter App Password / Pass"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer flex items-center h-full"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Security & Alerts</h3>
              
              <div className="flex items-start gap-3 select-none">
                <Checkbox 
                  id="twoFactor" 
                  checked={twoFactor}
                  onCheckedChange={(checked) => setTwoFactor(!!checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="twoFactor" className="flex flex-col gap-0.5 cursor-pointer">
                  <span className="text-sm font-medium text-foreground">Require Multi-Factor Authentication (MFA)</span>
                  <span className="text-xs text-muted-foreground">Keep supervisor accounts safe using 2FA token security challenges.</span>
                </label>
              </div>

              <div className="flex items-start gap-3 select-none">
                <Checkbox 
                  id="notify" 
                  checked={notify}
                  onCheckedChange={(checked) => setNotify(!!checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="notify" className="flex flex-col gap-0.5 cursor-pointer">
                  <span className="text-sm font-medium text-foreground">Enable Web Notification Alerts</span>
                  <span className="text-xs text-muted-foreground">Display pop-up banners when users request document signatures.</span>
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end bg-muted/20">
            <Button 
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 text-sm font-semibold rounded-md shadow-xs active:scale-95 transition-all cursor-pointer border-0"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
