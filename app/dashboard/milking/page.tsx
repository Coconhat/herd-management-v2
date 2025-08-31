import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, TrendingUp, Droplets } from "lucide-react"

export default async function MilkingPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: recentRecords } = await supabase
    .from("milking_records")
    .select(`
      *,
      cows (tag_number, name)
    `)
    .eq("user_id", user.user.id)
    .order("milking_date", { ascending: false })
    .order("milking_time", { ascending: false })
    .limit(10)

  // Get today's milking summary
  const today = new Date().toISOString().split("T")[0]
  const { data: todayRecords } = await supabase
    .from("milking_records")
    .select("milk_yield_liters, milking_time")
    .eq("user_id", user.user.id)
    .eq("milking_date", today)

  const todayTotal = todayRecords?.reduce((sum, record) => sum + record.milk_yield_liters, 0) || 0
  const morningTotal =
    todayRecords
      ?.filter((r) => r.milking_time === "morning")
      .reduce((sum, record) => sum + record.milk_yield_liters, 0) || 0
  const afternoonTotal =
    todayRecords
      ?.filter((r) => r.milking_time === "afternoon")
      .reduce((sum, record) => sum + record.milk_yield_liters, 0) || 0
  const eveningTotal =
    todayRecords
      ?.filter((r) => r.milking_time === "evening")
      .reduce((sum, record) => sum + record.milk_yield_liters, 0) || 0

  const getTimeColor = (time: string) => {
    switch (time) {
      case "morning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "afternoon":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "evening":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "abnormal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "bloody":
        return "bg-red-100 text-red-800 border-red-200"
      case "watery":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">🥛 Milking Records</h1>
            <p className="text-green-600">Track daily milk production</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/milking/add">
                <Plus className="w-4 h-4 mr-2" />
                Record Milking
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

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 mb-1">Today's Total</p>
                  <p className="text-3xl font-bold text-green-800">{todayTotal.toFixed(1)}L</p>
                </div>
                <Droplets className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 mb-1">Morning</p>
                  <p className="text-2xl font-bold text-yellow-800">{morningTotal.toFixed(1)}L</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">AM</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 mb-1">Afternoon</p>
                  <p className="text-2xl font-bold text-orange-800">{afternoonTotal.toFixed(1)}L</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">PM</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-1">Evening</p>
                  <p className="text-2xl font-bold text-blue-800">{eveningTotal.toFixed(1)}L</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">EVE</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Records */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Milking Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentRecords || recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <Droplets className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">No Milking Records</h3>
                <p className="text-green-600 mb-4">Start tracking your daily milk production.</p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard/milking/add">
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Milking
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-green-800">
                          {record.cows?.name || `Cow #${record.cows?.tag_number}`}
                        </h3>
                        <p className="text-sm text-green-600">{new Date(record.milking_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getTimeColor(record.milking_time)}>{record.milking_time}</Badge>
                        <Badge className={getQualityColor(record.milk_quality)}>{record.milk_quality}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">{record.milk_yield_liters}L</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
