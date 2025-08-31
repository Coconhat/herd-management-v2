import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AddReminderForm from "@/components/add-reminder-form"

export default async function AddReminderPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get all cows for the dropdown
  const { data: cows } = await supabase
    .from("cows")
    .select("id, tag_number, name")
    .eq("status", "active")
    .order("tag_number")

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-800">Add New Reminder</h1>
          <p className="text-green-600 mt-2">Schedule important farm activities</p>
        </div>

        <AddReminderForm cows={cows || []} />
      </div>
    </div>
  )
}
