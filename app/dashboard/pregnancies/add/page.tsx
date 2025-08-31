import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddPregnancyForm } from "@/components/add-pregnancy-form"

export default async function AddPregnancyPage() {
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

  const { data: breedingRecords } = await supabase
    .from("breeding_records")
    .select(`
      id,
      breeding_date,
      cows (tag_number, name)
    `)
    .eq("user_id", user.user.id)
    .is("success", null)
    .order("breeding_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Confirm Pregnancy</h1>
            <p className="text-green-600">Record a confirmed pregnancy</p>
          </div>
          <AddPregnancyForm cows={cows || []} breedingRecords={breedingRecords || []} />
        </div>
      </div>
    </div>
  )
}
