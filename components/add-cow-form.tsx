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

export function AddCowForm() {
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
      setError("You must be logged in to add a cow")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.from("cows").insert({
        user_id: user.id,
        tag_number: formData.get("tag_number") as string,
        name: (formData.get("name") as string) || null,
        breed: (formData.get("breed") as string) || null,
        date_of_birth: (formData.get("date_of_birth") as string) || null,
        status: formData.get("status") as string,
        color: (formData.get("color") as string) || null,
        weight_kg: formData.get("weight_kg") ? Number.parseFloat(formData.get("weight_kg") as string) : null,
        notes: (formData.get("notes") as string) || null,
      })

      if (error) throw error

      router.push("/dashboard/cows")
    } catch (error: any) {
      setError(error.message || "An error occurred while adding the cow")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/cows">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Cow Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag_number" className="text-green-700">
                Tag Number *
              </Label>
              <Input
                id="tag_number"
                name="tag_number"
                required
                placeholder="e.g., 001, A123"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">
                Name (Optional)
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Bessie, Daisy"
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
                placeholder="e.g., Holstein, Jersey, Angus"
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
                  <SelectItem value="pregnant">Pregnant</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="weight_kg" className="text-green-700">
                Weight (kg)
              </Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.01"
                placeholder="e.g., 450.5"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-green-700">
              Color
            </Label>
            <Input
              id="color"
              name="color"
              placeholder="e.g., Black and White, Brown, Red"
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
              placeholder="Any additional notes about this cow..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Adding Cow..." : "Add Cow"}
            </Button>
            <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Link href="/dashboard/cows">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
