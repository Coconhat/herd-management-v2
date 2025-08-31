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
import { ArrowLeft, Trash2 } from "lucide-react"

interface Cow {
  id: string
  tag_number: string
  name: string | null
  breed: string | null
  date_of_birth: string | null
  status: string
  color: string | null
  weight_kg: number | null
  notes: string | null
}

export function EditCowForm({ cow }: { cow: Cow }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("cows")
        .update({
          tag_number: formData.get("tag_number") as string,
          name: (formData.get("name") as string) || null,
          breed: (formData.get("breed") as string) || null,
          date_of_birth: (formData.get("date_of_birth") as string) || null,
          status: formData.get("status") as string,
          color: (formData.get("color") as string) || null,
          weight_kg: formData.get("weight_kg") ? Number.parseFloat(formData.get("weight_kg") as string) : null,
          notes: (formData.get("notes") as string) || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cow.id)

      if (error) throw error

      router.push(`/dashboard/cows/${cow.id}`)
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the cow")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cow? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("cows").delete().eq("id", cow.id)

      if (error) throw error

      router.push("/dashboard/cows")
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting the cow")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href={`/dashboard/cows/${cow.id}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Edit Cow Information</CardTitle>
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
                defaultValue={cow.tag_number}
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
                defaultValue={cow.name || ""}
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
                defaultValue={cow.breed || ""}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-green-700">
                Status *
              </Label>
              <Select name="status" defaultValue={cow.status}>
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
                defaultValue={cow.date_of_birth || ""}
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
                defaultValue={cow.weight_kg || ""}
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
              defaultValue={cow.color || ""}
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
              defaultValue={cow.notes || ""}
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Cow"}
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
                <Link href={`/dashboard/cows/${cow.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? "Updating..." : "Update Cow"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
