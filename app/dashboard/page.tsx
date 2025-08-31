import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Cog as Cow, Users, Calendar, Pill } from "lucide-react"
import Breadcrumbs from "@/components/breadcrumbs"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: cows } = await supabase.from("cows").select("status").eq("user_id", data.user.id)
  const { data: pregnancies } = await supabase
    .from("pregnancies")
    .select("pregnancy_status")
    .eq("user_id", data.user.id)
    .eq("pregnancy_status", "confirmed")
  const { data: reminders } = await supabase
    .from("reminders")
    .select("completed")
    .eq("user_id", data.user.id)
    .eq("completed", false)

  const totalCows = cows?.length || 0
  const activeCows = cows?.filter((cow) => cow.status === "active").length || 0
  const pregnantCows = cows?.filter((cow) => cow.status === "pregnant").length || 0
  const activePregnancies = pregnancies?.length || 0
  const pendingReminders = reminders?.length || 0

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Farm Dashboard</h1>
          <p className="text-green-600 mt-2">Welcome back, {profile?.full_name || data.user.email}</p>
          {profile?.farm_name && <p className="text-sm text-green-500">{profile.farm_name}</p>}
        </div>
        <form action={handleSignOut}>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Total Cows</p>
                <p className="text-3xl font-bold text-green-800">{totalCows}</p>
              </div>
              <Cow className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Active Cows</p>
                <p className="text-3xl font-bold text-green-800">{activeCows}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Pregnant Cows</p>
                <p className="text-3xl font-bold text-green-800">{pregnantCows}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Pending Reminders</p>
                <p className="text-3xl font-bold text-green-800">{pendingReminders}</p>
              </div>
              <Pill className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Cow className="w-5 h-5" />
              Cow Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Manage your cattle herd, track status, and view detailed information.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/cows">Manage Cows</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800">Breeding & Pregnancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Track breeding records, pregnancies, and calving schedules.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/breeding">Manage Breeding</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800">Medicine & Treatment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Manage medicine inventory and track treatments.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/medicine">Manage Medicine</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800">Milking Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Track daily milk production and quality.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/milking">Manage Milking</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Set and manage reminders for important farm tasks.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/reminders">Manage Reminders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Generate reports and analyze your farm data.</p>
            <Button variant="outline" className="w-full border-green-300 text-green-700 bg-transparent" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
