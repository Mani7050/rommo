import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="hidden md:flex justify-center md:justify-start">
          <a href="#" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-16 w-auto" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center pb-20">
          <div className="w-full max-w-xs flex flex-col gap-6">
            <div className="flex justify-center md:hidden">
              <a href="#" className="flex items-center">
                <img src="/logo.svg" alt="Logo" className="h-16 w-auto" />
              </a>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/coworking_login.png"
          alt="Rommo Coworking Space"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
