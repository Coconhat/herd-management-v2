import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddCowForm } from "@/components/add-cow-form"

export default async function AddCowPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Add New Cow</h1>
            <p className="text-green-600">Add a new cow to your herd</p>
          </div>
          <AddCowForm />
        </div>
      </div>
    </div>
  )
}
