import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddBreedingForm } from "@/components/add-breeding-form"

export default async function AddBreedingPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: cows } = await supabase
    .from("cows")
    .select("id, tag_number, name")
    .eq("user_id", user.user.id)
    .in("status", ["active"])
    .order("tag_number")

  const { data: bulls } = await supabase
    .from("bulls")
    .select("id, name")
    .eq("user_id", user.user.id)
    .eq("status", "active")
    .order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Add Breeding Record</h1>
            <p className="text-green-600">Record a new breeding activity</p>
          </div>
          <AddBreedingForm cows={cows || []} bulls={bulls || []} />
        </div>
      </div>
    </div>
  )
}
