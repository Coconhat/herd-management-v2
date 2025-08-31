import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddMilkingForm } from "@/components/add-milking-form"

export default async function AddMilkingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Record Milking</h1>
            <p className="text-green-600">Record milk production for a cow</p>
          </div>
          <AddMilkingForm cows={cows || []} />
        </div>
      </div>
    </div>
  )
}
