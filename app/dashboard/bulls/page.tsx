import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Eye, Edit } from "lucide-react"

export default async function BullsPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: bulls } = await supabase
    .from("bulls")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "retired":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sold":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">🐂 Bull Management</h1>
            <p className="text-green-600">Manage your breeding bulls</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/bulls/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Bull
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              <Link href="/dashboard/breeding">Back to Breeding</Link>
            </Button>
          </div>
        </div>

        {!bulls || bulls.length === 0 ? (
          <Card className="border-green-200 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🐂</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">No Bulls Yet</h3>
              <p className="text-green-600 mb-4">Add bulls to track breeding activities.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/bulls/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Bull
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bulls.map((bull) => (
              <Card key={bull.id} className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-green-800 text-lg">{bull.name}</CardTitle>
                      {bull.registration_number && (
                        <p className="text-sm text-green-600">Reg: {bull.registration_number}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(bull.status)}>{bull.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {bull.breed && (
                      <div>
                        <span className="text-green-600">Breed:</span>
                        <p className="font-medium text-green-800">{bull.breed}</p>
                      </div>
                    )}
                    {bull.date_of_birth && (
                      <div>
                        <span className="text-green-600">Age:</span>
                        <p className="font-medium text-green-800">
                          {Math.floor(
                            (new Date().getTime() - new Date(bull.date_of_birth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000),
                          )}{" "}
                          years
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 bg-transparent"
                    >
                      <Link href={`/dashboard/bulls/${bull.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 bg-transparent"
                    >
                      <Link href={`/dashboard/bulls/${bull.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
