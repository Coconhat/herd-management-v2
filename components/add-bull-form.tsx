"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AddBullForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to add a bull")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.from("bulls").insert({
        user_id: user.id,
        name: formData.get("name") as string,
        breed: (formData.get("breed") as string) || null,
        registration_number: (formData.get("registration_number") as string) || null,
        date_of_birth: (formData.get("date_of_birth") as string) || null,
        status: formData.get("status") as string,
        notes: (formData.get("notes") as string) || null,
      })

      if (error) throw error

      router.push("/dashboard/bulls")
    } catch (error: any) {
      setError(error.message || "An error occurred while adding the bull")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/bulls">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Bull Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Thunder, Champion"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number" className="text-green-700">
                Registration Number
              </Label>
              <Input
                id="registration_number"
                name="registration_number"
                placeholder="e.g., ABC123456"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-green-700">
                Breed
              </Label>
              <Input
                id="breed"
                name="breed"
                placeholder="e.g., Holstein, Angus, Hereford"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-green-700">
                Status *
              </Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-green-700">
              Date of Birth
            </Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this bull..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Adding Bull..." : "Add Bull"}
            </Button>
            <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Link href="/dashboard/bulls">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
