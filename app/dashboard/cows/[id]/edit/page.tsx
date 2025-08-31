import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditCowForm } from "@/components/edit-cow-form"

export default async function EditCowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: cow } = await supabase.from("cows").select("*").eq("id", id).eq("user_id", user.user.id).single()

  if (!cow) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Edit Cow</h1>
            <p className="text-green-600">Update {cow.name || `Cow #${cow.tag_number}`} information</p>
          </div>
          <EditCowForm cow={cow} />
        </div>
      </div>
    </div>
  )
}
