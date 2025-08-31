import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Eye, Calendar, Heart } from "lucide-react"

export default async function BreedingPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: breedingRecords } = await supabase
    .from("breeding_records")
    .select(`
      *,
      cows (tag_number, name),
      bulls (name)
    `)
    .eq("user_id", user.user.id)
    .order("breeding_date", { ascending: false })

  const { data: pregnancies } = await supabase
    .from("pregnancies")
    .select(`
      *,
      cows (tag_number, name)
    `)
    .eq("user_id", user.user.id)
    .eq("pregnancy_status", "confirmed")
    .order("expected_calving_date", { ascending: true })

  const getBreedingTypeColor = (type: string) => {
    return type === "natural"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getSuccessColor = (success: boolean | null) => {
    if (success === null) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return success ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
  }

  const getSuccessText = (success: boolean | null) => {
    if (success === null) return "Unknown"
    return success ? "Successful" : "Failed"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">🐄 Breeding & Pregnancy</h1>
            <p className="text-green-600">Manage breeding records and track pregnancies</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/breeding/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Breeding Record
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              <Link href="/dashboard/bulls">Manage Bulls</Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Breeding Records */}
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Recent Breeding Records</h2>
            {!breedingRecords || breedingRecords.length === 0 ? (
              <Card className="border-green-200 shadow-lg">
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">No Breeding Records</h3>
                  <p className="text-green-600 mb-4">Start tracking breeding activities.</p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/dashboard/breeding/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Record
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {breedingRecords.slice(0, 5).map((record) => (
                  <Card key={record.id} className="border-green-200 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-green-800">
                            {record.cows?.name || `Cow #${record.cows?.tag_number}`}
                          </h3>
                          <p className="text-sm text-green-600">
                            {new Date(record.breeding_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getBreedingTypeColor(record.breeding_type)}>
                            {record.breeding_type === "natural" ? "Natural" : "AI"}
                          </Badge>
                          <Badge className={getSuccessColor(record.success)}>{getSuccessText(record.success)}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">
                        {record.breeding_type === "natural" && record.bulls?.name && <p>Bull: {record.bulls.name}</p>}
                        {record.breeding_type === "artificial_insemination" && record.semen_batch && (
                          <p>Semen Batch: {record.semen_batch}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {breedingRecords.length > 5 && (
                  <Button asChild variant="outline" className="w-full border-green-300 text-green-700 bg-transparent">
                    <Link href="/dashboard/breeding/records">View All Records</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Active Pregnancies */}
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Active Pregnancies</h2>
            {!pregnancies || pregnancies.length === 0 ? (
              <Card className="border-green-200 shadow-lg">
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">No Active Pregnancies</h3>
                  <p className="text-green-600">Confirmed pregnancies will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pregnancies.map((pregnancy) => {
                  const daysUntilCalving = Math.ceil(
                    (new Date(pregnancy.expected_calving_date).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                  return (
                    <Card key={pregnancy.id} className="border-green-200 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-green-800">
                              {pregnancy.cows?.name || `Cow #${pregnancy.cows?.tag_number}`}
                            </h3>
                            <p className="text-sm text-green-600">
                              Expected: {new Date(pregnancy.expected_calving_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={
                              daysUntilCalving <= 30
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {daysUntilCalving > 0 ? `${daysUntilCalving} days` : "Overdue"}
                          </Badge>
                        </div>
                        <div className="text-sm text-green-700">
                          <p>Conception: {new Date(pregnancy.conception_date).toLocaleDateString()}</p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="mt-2 border-green-300 text-green-700 bg-transparent"
                        >
                          <Link href={`/dashboard/pregnancies/${pregnancy.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
