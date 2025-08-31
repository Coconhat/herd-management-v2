import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, Weight, Palette } from "lucide-react"

export default async function CowDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const ageInYears = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return Math.floor(ageInYears)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="ghost" size="sm" className="text-green-700">
              <Link href="/dashboard/cows">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cows
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-green-800">{cow.name || `Cow #${cow.tag_number}`}</h1>
              <p className="text-green-600">Tag Number: {cow.tag_number}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(cow.status)}>{cow.status}</Badge>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href={`/dashboard/cows/${cow.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Tag Number</p>
                    <p className="font-semibold text-green-800">{cow.tag_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 mb-1">Status</p>
                    <Badge className={getStatusColor(cow.status)}>{cow.status}</Badge>
                  </div>
                </div>

                {cow.name && (
                  <div>
                    <p className="text-sm text-green-600 mb-1">Name</p>
                    <p className="font-semibold text-green-800">{cow.name}</p>
                  </div>
                )}

                {cow.breed && (
                  <div>
                    <p className="text-sm text-green-600 mb-1">Breed</p>
                    <p className="font-semibold text-green-800">{cow.breed}</p>
                  </div>
                )}

                {cow.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 mb-1">Date of Birth</p>
                      <p className="font-semibold text-green-800">
                        {new Date(cow.date_of_birth).toLocaleDateString()} ({calculateAge(cow.date_of_birth)} years old)
                      </p>
                    </div>
                  </div>
                )}

                {cow.weight_kg && (
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 mb-1">Weight</p>
                      <p className="font-semibold text-green-800">{cow.weight_kg} kg</p>
                    </div>
                  </div>
                )}

                {cow.color && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 mb-1">Color</p>
                      <p className="font-semibold text-green-800">{cow.color}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-green-600 mb-1">Added to System</p>
                  <p className="font-semibold text-green-800">{new Date(cow.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-green-600 mb-1">Last Updated</p>
                  <p className="font-semibold text-green-800">{new Date(cow.updated_at).toLocaleDateString()}</p>
                </div>

                {cow.notes && (
                  <div>
                    <p className="text-sm text-green-600 mb-2">Notes</p>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-green-800 whitespace-pre-wrap">{cow.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    <Link href="/dashboard/breeding/add">Add Breeding Record</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    <Link href="/dashboard/pregnancies/add">Confirm Pregnancy</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    Record Treatment
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    Add Milking Record
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
