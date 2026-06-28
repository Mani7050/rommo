import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("rememberedEmail") || ""
  })
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem("rememberedEmail")
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Pure local login - bypasses Firebase completely
    setTimeout(() => {
      setLoading(false)
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }
      toast.success("Welcome back! (Admin Mode)", {
        description: "You have successfully logged in to Rommo Admin Panel.",
        duration: 1500,
      })
      navigate("/dashboard")
    }, 800)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Error", { description: "Please enter your email address first." })
      return
    }
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      toast.success("Password Reset Email Sent", {
        description: `A reset link has been dispatched to ${email}.`,
      })
      setIsForgotPassword(false)
    }, 800)
  }

  if (isForgotPassword) {
    return (
      <form
        onSubmit={handleResetPassword}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="reset-email">Email</FieldLabel>
            <Input
              id="reset-email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field className="flex flex-col gap-2">
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsForgotPassword(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Back to Login
            </Button>
          </Field>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer border-0 bg-transparent"
            >
              Forgot your password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background"
          />
        </Field>
        <div className="flex items-center gap-2 select-none">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            className="cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-sm font-medium text-foreground cursor-pointer">
            Remember me
          </label>
        </div>
        <Field>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
