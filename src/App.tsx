import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import LoginPage from "@/pages/auth/login"
import { DashboardLayout } from "@/components/layout"
import DashboardPage from "@/pages/dashboard/page"
import UsersPage from "@/pages/users/page"
import PaymentsPage from "@/pages/payments/page"
import SupportTicketsPage from "@/pages/support-tickets/page"
import FAQsPage from "@/pages/faqs/page"
import SettingsPage from "@/pages/settings/page"
import WorkspacesPage from "@/pages/workspaces/page"

export function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/workspaces" element={<WorkspacesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/support-tickets" element={<SupportTicketsPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  )
}

export default App
