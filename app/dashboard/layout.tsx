import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <DashboardNav user={user} />
      <main className="lg:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
