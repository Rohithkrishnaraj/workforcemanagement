import { redirect } from "next/navigation"

// This is a catch-all page that will redirect to the appropriate dashboard
export default function DashboardPage() {
  redirect("/login")
  return null
}

