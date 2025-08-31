"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Cow {
  id: string
  tag_number: string
  name: string | null
}

interface AddReminderFormProps {
  cows: Cow[]
}

export default function AddReminderForm({ cows }: AddReminderFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dueDate = formData.get("due_date") as string
    const priority = formData.get("priority") as string
    const reminderType = formData.get("reminder_type") as string
    const cowId = formData.get("cow_id") as string

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("reminders").insert({
        title,
        description,
        due_date: dueDate,
        priority,
        reminder_type: reminderType,
        cow_id: cowId || null,
        user_id: user.id,
        completed: false,
      })

      if (insertError) throw insertError

      router.push("/dashboard/reminders")
    } catch (err) {
      console.error("Error adding reminder:", err)
      setError(err instanceof Error ? err.message : "Failed to add reminder")
    } finally {
      setLoading(false)
    }
  }

  const reminderTypes = [
    { value: "breeding", label: "Breeding" },
    { value: "vaccination", label: "Vaccination" },
    { value: "health_check", label: "Health Check" },
    { value: "dry_off", label: "Dry Off" },
    { value: "calving", label: "Expected Calving" },
    { value: "medicine", label: "Medicine Treatment" },
    { value: "milking", label: "Milking" },
    { value: "feeding", label: "Feeding" },
    { value: "maintenance", label: "Equipment Maintenance" },
    { value: "other", label: "Other" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reminders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calendar className="w-5 h-5" />
              New Reminder
            </CardTitle>
            <CardDescription>Schedule an important farm activity</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Vaccinate Cow #123"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_type">Type</Label>
              <Select name="reminder_type" required>
                <SelectTrigger className="border-green-200 focus:border-green-500">
                  <SelectValue placeholder="Select reminder type" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Additional details about this reminder..."
              rows={3}
              className="border-green-200 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="border-green-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cow_id">Related Cow (Optional)</Label>
            <Select name="cow_id">
              <SelectTrigger className="border-green-200 focus:border-green-500">
                <SelectValue placeholder="Select a cow (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cows.map((cow) => (
                  <SelectItem key={cow.id} value={cow.id}>
                    #{cow.tag_number} {cow.name && `- ${cow.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Adding..." : "Add Reminder"}
            </Button>
            <Link href="/dashboard/reminders">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
