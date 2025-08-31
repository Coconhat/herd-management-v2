import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"
import Link from "next/link"

export default async function RemindersPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get all reminders with cow information
  const { data: reminders } = await supabase
    .from("reminders")
    .select(`
      *,
      cows (
        tag_number,
        name
      )
    `)
    .order("due_date", { ascending: true })

  const today = new Date()
  const overdueReminders = reminders?.filter((r) => new Date(r.due_date) < today && !r.completed) || []
  const upcomingReminders = reminders?.filter((r) => new Date(r.due_date) >= today && !r.completed) || []
  const completedReminders = reminders?.filter((r) => r.completed) || []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysUntil = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return "Due today"
    return `${days} days`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Farm Reminders</h1>
          <p className="text-green-600 mt-2">Stay on top of important farm activities</p>
        </div>
        <Link href="/dashboard/reminders/add">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{overdueReminders.length}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{upcomingReminders.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{completedReminders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Overdue Reminders
            </CardTitle>
            <CardDescription>These reminders need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-red-900">{reminder.title}</h3>
                      <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                    </div>
                    <p className="text-red-700 text-sm mb-1">{reminder.description}</p>
                    {reminder.cows && (
                      <p className="text-red-600 text-sm">Cow: {reminder.cows.name || reminder.cows.tag_number}</p>
                    )}
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {formatDate(reminder.due_date)} • {getDaysUntil(reminder.due_date)}
                    </div>
                  </div>
                  <form action={`/api/reminders/${reminder.id}/complete`} method="POST">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Mark Complete
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Reminders
          </CardTitle>
          <CardDescription>Scheduled farm activities</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-green-900">{reminder.title}</h3>
                      <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                    </div>
                    <p className="text-green-700 text-sm mb-1">{reminder.description}</p>
                    {reminder.cows && (
                      <p className="text-green-600 text-sm">Cow: {reminder.cows.name || reminder.cows.tag_number}</p>
                    )}
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {formatDate(reminder.due_date)} • {getDaysUntil(reminder.due_date)}
                    </div>
                  </div>
                  <form action={`/api/reminders/${reminder.id}/complete`} method="POST">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                    >
                      Mark Complete
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recently Completed
            </CardTitle>
            <CardDescription>Last 10 completed reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedReminders.slice(0, 10).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    {reminder.cows && (
                      <p className="text-gray-600 text-sm">Cow: {reminder.cows.name || reminder.cows.tag_number}</p>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CalendarDays className="w-4 h-4" />
                      Completed on {formatDate(reminder.completed_date || reminder.due_date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
