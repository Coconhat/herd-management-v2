import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddTreatmentForm } from "@/components/add-treatment-form"

export default async function AddTreatmentPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: cows } = await supabase
    .from("cows")
    .select("id, tag_number, name")
    .eq("user_id", user.user.id)
    .in("status", ["active", "pregnant"])
    .order("tag_number")

  const { data: medicines } = await supabase
    .from("medicine_inventory")
    .select("id, name, type, unit, quantity_remaining")
    .eq("user_id", user.user.id)
    .gt("quantity_remaining", 0)
    .order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Record Treatment</h1>
            <p className="text-green-600">Record a medicine treatment for a cow</p>
          </div>
          <AddTreatmentForm cows={cows || []} medicines={medicines || []} />
        </div>
      </div>
    </div>
  )
}
