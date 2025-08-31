import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Eye, Edit } from "lucide-react"

export default async function CowsPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: cows } = await supabase
    .from("cows")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pregnant":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "dry":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sold":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "deceased":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">🐄 Cow Management</h1>
            <p className="text-green-600">Manage your cattle herd</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/cows/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Cow
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {!cows || cows.length === 0 ? (
          <Card className="border-green-200 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">No Cows Yet</h3>
              <p className="text-green-600 mb-4">Start building your herd by adding your first cow.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/cows/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Cow
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cows.map((cow) => (
              <Card key={cow.id} className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-green-800 text-lg">{cow.name || `Cow #${cow.tag_number}`}</CardTitle>
                      <p className="text-sm text-green-600">Tag: {cow.tag_number}</p>
                    </div>
                    <Badge className={getStatusColor(cow.status)}>{cow.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {cow.breed && (
                      <div>
                        <span className="text-green-600">Breed:</span>
                        <p className="font-medium text-green-800">{cow.breed}</p>
                      </div>
                    )}
                    {cow.date_of_birth && (
                      <div>
                        <span className="text-green-600">Age:</span>
                        <p className="font-medium text-green-800">
                          {Math.floor(
                            (new Date().getTime() - new Date(cow.date_of_birth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000),
                          )}{" "}
                          years
                        </p>
                      </div>
                    )}
                    {cow.weight_kg && (
                      <div>
                        <span className="text-green-600">Weight:</span>
                        <p className="font-medium text-green-800">{cow.weight_kg} kg</p>
                      </div>
                    )}
                    {cow.color && (
                      <div>
                        <span className="text-green-600">Color:</span>
                        <p className="font-medium text-green-800">{cow.color}</p>
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
                      <Link href={`/dashboard/cows/${cow.id}`}>
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
                      <Link href={`/dashboard/cows/${cow.id}/edit`}>
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
